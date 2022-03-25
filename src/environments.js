import fs from "fs";
import glob from "glob";
import path from "path";
import typescript from "typescript";

import { logKind } from "./process/_internal.js";

function feedEnvironments(node, environments) {
  if (Array.isArray(node)) {
    return node.forEach((child) => feedEnvironments(child, environments));
  }
  if (!node || !node.kind) return;

  switch (node.kind) {
    case typescript.SyntaxKind.ExportSpecifier:
    case typescript.SyntaxKind.BreakStatement:
    case typescript.SyntaxKind.ContinueStatement:
    case typescript.SyntaxKind.DeleteExpression:
    case typescript.SyntaxKind.ThisKeyword:
    case typescript.SyntaxKind.TypeOfExpression:
    case typescript.SyntaxKind.SpreadAssignment:
    case typescript.SyntaxKind.SpreadElement:
    case typescript.SyntaxKind.ShorthandPropertyAssignment:
    case typescript.SyntaxKind.AsExpression:
    case typescript.SyntaxKind.FirstTemplateToken:
    case typescript.SyntaxKind.FirstLiteralToken:
    case typescript.SyntaxKind.EnumDeclaration:
    case typescript.SyntaxKind.ModuleDeclaration:
    case typescript.SyntaxKind.InterfaceDeclaration:
    case typescript.SyntaxKind.TypeAliasDeclaration:
    case typescript.SyntaxKind.StringLiteral:
    case typescript.SyntaxKind.NullKeyword:
    case typescript.SyntaxKind.TrueKeyword:
    case typescript.SyntaxKind.FalseKeyword:
    case typescript.SyntaxKind.RegularExpressionLiteral:
    case typescript.SyntaxKind.Identifier:
    case typescript.SyntaxKind.NamespaceExportDeclaration:
    case typescript.SyntaxKind.ImportEqualsDeclaration:
    case typescript.SyntaxKind.ElementAccessExpression:
    case typescript.SyntaxKind.ImportDeclaration: {
      break;
    }
    case typescript.SyntaxKind.FirstStatement: {
      return feedEnvironments(node.declarationList, environments);
    }
    case typescript.SyntaxKind.VariableDeclarationList: {
      return feedEnvironments(node.declarations, environments);
    }
    case typescript.SyntaxKind.Parameter:
    case typescript.SyntaxKind.PropertyAssignment:
    case typescript.SyntaxKind.PropertyDeclaration:
    case typescript.SyntaxKind.VariableDeclaration: {
      return feedEnvironments(node.initializer, environments);
    }
    case typescript.SyntaxKind.NewExpression:
    case typescript.SyntaxKind.CallExpression: {
      return feedEnvironments(node.arguments, environments);
    }
    case typescript.SyntaxKind.ObjectLiteralExpression: {
      return feedEnvironments(node.properties, environments);
    }
    case typescript.SyntaxKind.PropertyAccessExpression: {
      if (node.expression && node.expression.expression) {
        if (node.expression.expression.escapedText === "process") {
          if (node.expression.name.escapedText === "env") {
            environments.add(node.name.escapedText);
          }
        }
      }
      break;
    }
    case typescript.SyntaxKind.FunctionDeclaration: {
      return feedEnvironments(node.body, environments);
    }
    case typescript.SyntaxKind.DefaultClause:
    case typescript.SyntaxKind.Block: {
      return feedEnvironments(node.statements, environments);
    }
    case typescript.SyntaxKind.ParenthesizedExpression:
    case typescript.SyntaxKind.ThrowStatement:
    case typescript.SyntaxKind.ReturnStatement:
    case typescript.SyntaxKind.TemplateExpression:
    case typescript.SyntaxKind.ExpressionStatement:
    case typescript.SyntaxKind.AwaitExpression:
    case typescript.SyntaxKind.ExportAssignment: {
      return feedEnvironments(node.expression, environments);
    }
    case typescript.SyntaxKind.ConditionalExpression: {
      feedEnvironments(node.condition, environments);
      feedEnvironments(node.whenTrue, environments);
      feedEnvironments(node.whenFalse, environments);
      break;
    }
    case typescript.SyntaxKind.ArrayLiteralExpression: {
      feedEnvironments(node.elements, environments);
      break;
    }
    case typescript.SyntaxKind.BinaryExpression: {
      feedEnvironments(node.left, environments);
      feedEnvironments(node.right, environments);
      break;
    }
    case typescript.SyntaxKind.ClassDeclaration: {
      return feedEnvironments(node.members, environments);
    }
    case typescript.SyntaxKind.TaggedTemplateExpression: {
      return feedEnvironments(node.templateSpans, environments);
    }
    case typescript.SyntaxKind.ExportDeclaration: {
      return feedEnvironments(node.exportClause, environments);
    }
    case typescript.SyntaxKind.NamedExports: {
      return feedEnvironments(node.elements, environments);
    }
    case typescript.SyntaxKind.FunctionExpression:
    case typescript.SyntaxKind.ArrowFunction:
    case typescript.SyntaxKind.Constructor:
    case typescript.SyntaxKind.MethodDeclaration: {
      feedEnvironments(node.parameters, environments);
      feedEnvironments(node.body, environments);
      break;
    }
    case typescript.SyntaxKind.TemplateExpression: {
      return feedEnvironments(node.templateSpans, environments);
    }
    case typescript.SyntaxKind.IfStatement: {
      feedEnvironments(node.expression, environments);
      feedEnvironments(node.thenStatement, environments);
      feedEnvironments(node.elseStatement, environments);
      break;
    }
    case typescript.SyntaxKind.TryStatement: {
      feedEnvironments(node.tryBlock, environments);
      feedEnvironments(node.catchClause, environments);
      feedEnvironments(node.finallyBlock, environments);
      break;
    }
    case typescript.SyntaxKind.CatchClause: {
      feedEnvironments(node.variableDeclaration, environments);
      feedEnvironments(node.block, environments);
      break;
    }
    case typescript.SyntaxKind.PostfixUnaryExpression:
    case typescript.SyntaxKind.PrefixUnaryExpression: {
      return feedEnvironments(node.operand, environments);
    }
    case typescript.SyntaxKind.ForStatement: {
      feedEnvironments(node.initializer, environments);
      feedEnvironments(node.condition, environments);
      feedEnvironments(node.incrementor, environments);
      feedEnvironments(node.statement, environments);
      break;
    }
    case typescript.SyntaxKind.SwitchStatement: {
      feedEnvironments(node.expression, environments);
      feedEnvironments(node.caseBlock, environments);
      break;
    }
    case typescript.SyntaxKind.CaseBlock: {
      return feedEnvironments(node.clauses, environments);
    }
    case typescript.SyntaxKind.WhileStatement:
    case typescript.SyntaxKind.CaseClause: {
      feedEnvironments(node.expression, environments);
      feedEnvironments(node.statements, environments);
      break;
    }
    case typescript.SyntaxKind.VoidExpression: {
      break;
    }
    case typescript.SyntaxKind.ForInStatement:
    case typescript.SyntaxKind.ForOfStatement: {
      feedEnvironments(node.initializer, environments);
      feedEnvironments(node.expression, environments);
      feedEnvironments(node.statement, environments);
      break;
    }
    case typescript.SyntaxKind.DoStatement: {
      feedEnvironments(node.statement, environments);
      feedEnvironments(node.expression, environments);
      break;
    }
    case typescript.SyntaxKind.JsxText: {
      break;
    }
    case typescript.SyntaxKind.JsxFragment:
    case typescript.SyntaxKind.JsxElement: {
      feedEnvironments(node.openingElement, environments);
      feedEnvironments(node.children, environments);
      break;
    }
    case typescript.SyntaxKind.JsxSelfClosingElement:
    case typescript.SyntaxKind.JsxOpeningElement: {
      return feedEnvironments(node.attributes, environments);
    }
    case typescript.SyntaxKind.JsxAttributes: {
      return feedEnvironments(node.properties, environments);
    }
    case typescript.SyntaxKind.JsxAttribute: {
      return feedEnvironments(node.initializer, environments);
    }
    case typescript.SyntaxKind.JsxSpreadAttribute:
    case typescript.SyntaxKind.JsxExpression: {
      return feedEnvironments(node.expression, environments);
    }

    default: {
      logKind(node);
      console.log(node);
      process.exit(0);
    }
  }
}

export function getEnvironmentsFromProjects(directory) {
  const paths = glob.sync("*/package.json", {
    cwd: directory,
  });

  return Object.fromEntries(
    paths.map((filepath) => {
      const directoryBase = path.dirname(filepath);
      const projectDirectory = path.join(directory, directoryBase);
      console.log({ dir: directoryBase });
      const value = {
        environments: Array.from(getEnvironmentsFromProject(projectDirectory)),
      };
      return [path.basename(directoryBase), value];
    })
  );
}

export function getEnvironmentsFromProject(directory, environments) {
  if (!environments) environments = new Set();

  const paths = glob.sync("{**/*.ts,**/*.tsx,**/*.js,**/*.jsx}", {
    cwd: directory,
    ignore: ["**/node_modules/**", "**/.git/**", "**/*.spec.ts"],
  });

  for (const filepath of paths) {
    const fullFilepath = path.join(directory, filepath);
    getEnvironmentsFromFile(fullFilepath, environments);
  }
  return environments;
}

export function getEnvironmentsFromFile(filepath, environments) {
  if (!environments) environments = new Set();

  const node = typescript.createSourceFile(
    filepath, // fileName
    fs.readFileSync(filepath, "utf8"), // sourceText
    typescript.ScriptTarget.Latest // langugeVersion
  );
  for (const statement of node.statements) {
    feedEnvironments(statement, environments);
  }
  return Array.from(environments).sort();
}
