import typescript from "typescript";

export function getDecoratorName(decorator) {
  return decorator.expression.expression.escapedText;
}

export function getDecoratorController(statement) {
  if (statement.decorators) {
    return statement.decorators.find(
      (decorator) => getDecoratorName(decorator) === "Controller"
    );
  }
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
