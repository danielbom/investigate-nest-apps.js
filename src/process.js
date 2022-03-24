import fs from "fs";
import glob from "glob";
import path from "path";
import typescript from "typescript";

import { getEnvironmentsFromProject } from "./environments.js";
import {
  extractControllerRoute,
  extractRestRoutes,
  getDecoratorController,
  getDecoratorName,
  getDecoratorRest,
} from "./process/_internal.js";

export function processOneFile(filepath, controllers = {}) {
  const node = typescript.createSourceFile(
    filepath, // fileName
    fs.readFileSync(filepath, "utf8"), // sourceText
    typescript.ScriptTarget.Latest // langugeVersion
  );

  for (const statement of node.statements) {
    const decoratorController = getDecoratorController(statement);
    if (decoratorController) {
      const baseRoute = extractControllerRoute(decoratorController);
      const controllerName = statement.name.escapedText;
      controllers[controllerName] = {
        route: baseRoute || "",
        routes: [],
        dependencies: [],
      };

      for (const member of statement.members) {
        const decoratorRest = getDecoratorRest(member);
        if (decoratorRest) {
          const methodRest = getDecoratorName(decoratorRest);
          const routes = extractRestRoutes(decoratorRest);
          routes.forEach((route) => {
            controllers[controllerName].routes.push({
              method: methodRest,
              route,
            });
          });
        }

        if (member.kind === typescript.SyntaxKind.Constructor) {
          for (const parameter of member.parameters) {
            if (parameter.type) {
              controllers[controllerName].dependencies.push(
                parameter.type.typeName.escapedText
              );
            }
          }
        }
      }
    }
  }

  return controllers;
}

export function processOneProject(directory, controllers = {}) {
  const paths = glob.sync("**/*.ts", {
    cwd: directory,
    ignore: ["**/node_modules/**", "**/.git/**", "**/*.spec.ts"],
  });

  for (const filepath of paths) {
    const fullFilepath = path.join(directory, filepath);
    processOneFile(fullFilepath, controllers);
  }

  return controllers;
}

export function processManyProjects(directory) {
  const paths = glob.sync("*/package.json", {
    cwd: directory,
  });

  return Object.fromEntries(
    paths.map((filepath) => {
      const directoryBase = path.dirname(filepath);
      const projectDirectory = path.join(directory, directoryBase);
      const value = {
        controllers: processOneProject(projectDirectory),
        environments: Array.from(getEnvironmentsFromProject(projectDirectory)),
      };
      return [path.basename(directoryBase), value];
    })
  );
}

export function joinProjects(projects) {
  return projects.reduce(
    (controllers, project) => Object.assign(controllers, project.controllers),
    {}
  );
}
