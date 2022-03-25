import fs from "fs";
import typescript from "typescript";

import {
  getDecoratorInjectable,
  extractDependencies,
} from "./process/_internal.js";

export function injectablesFromOneFile(filepath, injectables = {}) {
  const node = typescript.createSourceFile(
    filepath, // fileName
    fs.readFileSync(filepath, "utf8"), // sourceText
    typescript.ScriptTarget.Latest // langugeVersion
  );

  for (const statement of node.statements) {
    if (statement.kind === typescript.SyntaxKind.ClassDeclaration) {
      // Injectables
      const decoratorInjectable = getDecoratorInjectable(statement);
      if (decoratorInjectable) {
        const className = statement.name.escapedText;
        injectables[className] = {
          dependencies: extractDependencies(statement),
        };
      }
    }
  }

  return injectables;
}
