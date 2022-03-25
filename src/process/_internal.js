import glob from "glob";
import typescript from "typescript";

export function getDecoratorName(decorator) {
  return decorator.expression.expression.escapedText;
}

export function getDecorator(statement, decoratorName) {
  if (statement.decorators) {
    return statement.decorators.find(
      (decorator) => getDecoratorName(decorator) === decoratorName
    );
  }
}

export function getDecoratorController(statement) {
  return getDecorator(statement, "Controller");
}

export function getDecoratorInjectable(statement) {
  return getDecorator(statement, "Injectable");
}

export function getConstructor(statement) {
  if (statement && Array.isArray(statement.members)) {
    return statement.members.find(
      (member) => member.kind === typescript.SyntaxKind.Constructor
    );
  }
}

export function extractDependencies(statement) {
  const classConstructor = getConstructor(statement);
  if (classConstructor && Array.isArray(classConstructor.parameters)) {
    return classConstructor.parameters
      .filter((x) => x.type)
      .map((x) => x.type.typeName.escapedText);
  }
  return [];
}

const REST_DECORATORS = ["Get", "Post", "Put", "Patch", "Delete"];
export function getDecoratorRest(member) {
  if (member.kind === typescript.SyntaxKind.MethodDeclaration) {
    if (member.decorators) {
      return member.decorators.find((decorator) =>
        REST_DECORATORS.includes(getDecoratorName(decorator))
      );
    }
  }
}

export function extractControllerRoute(decorator) {
  const args = decorator.expression.arguments;
  return args[0] ? args[0].text : undefined;
}

function resolveOneRoute(value) {
  if (typeof value === "string") {
    if (value.length === 0) {
      return "/";
    } else {
      return value;
    }
  }
  return null;
}

export function extractRestRoutes(decorator) {
  const args = decorator.expression.arguments;
  if (!args[0]) return ["/"];

  if (args[0].kind === typescript.SyntaxKind.ArrayLiteralExpression) {
    return args[0].elements.map((el) => resolveOneRoute(el.text));
  } else {
    return [resolveOneRoute(args[0].text)];
  }
}

export function logKind(anyExpression) {
  console.log(typescript.SyntaxKind[anyExpression.kind]);
}

export function getTypescriptFiles(directory) {
  return glob.sync("**/*.ts", {
    cwd: directory,
    ignore: ["**/node_modules/**", "**/.git/**", "**/*.spec.ts"],
  });
}
