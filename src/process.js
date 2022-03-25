import fs from "fs";
import glob from "glob";
import path from "path";
import typescript from "typescript";

import { getEnvironmentsFromProject } from "./environments.js";
import { injectablesFromOneFile } from "./injectables.js";
import {
  extractControllerRoute,
  extractRestRoutes,
  getTypescriptFiles,
  getDecoratorController,
  getDecoratorName,
  getDecoratorRest,
} from "./process/_internal.js";

export function controllersFromOneFile(filepath, controllers = {}) {
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

function applyOnTypescriptProject(callback, directory, data) {
  getTypescriptFiles(directory).forEach((filepath) => {
    const fullFilepath = path.join(directory, filepath);
    callback(fullFilepath, data);
  });
  return data;
}

export function processOneProject(directory) {
  return {
    controllers: applyOnTypescriptProject(
      controllersFromOneFile,
      directory,
      {}
    ),
    injectables: applyOnTypescriptProject(
      injectablesFromOneFile,
      directory,
      {}
    ),
    environments: Array.from(getEnvironmentsFromProject(directory)),
  };
}

export function processManyProjects(directory) {
  const paths = glob.sync("*/package.json", {
    cwd: directory,
  });

  return Object.fromEntries(
    paths.map((filepath) => {
      const directoryBase = path.dirname(filepath);
      const projectDirectory = path.join(directory, directoryBase);
      console.log({ dir: directoryBase });
      return [
        path.basename(directoryBase),
        processOneProject(projectDirectory),
      ];
    })
  );
}

export function joinProjects(projects) {
  return projects.reduce(
    (controllers, project) => Object.assign(controllers, project.controllers),
    {}
  );
}
