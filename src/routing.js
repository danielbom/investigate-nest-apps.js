import { println } from "./core/writter.js";

function joinRoute(route1, route2) {
  if (route1.endsWith("/")) {
    if (route2.startsWith("/")) {
      return route1 + route2.slice(1);
    } else {
      return route1 + route2;
    }
  } else {
    if (route2.startsWith("/")) {
      return route1 + route2;
    } else {
      return route1 + "/" + route2;
    }
  }
}

export function createRoutingFromProjectsWritter(
  projects,
  writter = process.stdout
) {
  const _println = (text) => println(text, writter);

  for (const projectName in projects) {
    _println(projectName);
    _println();

    const project = projects[projectName];
    for (const controllerName in project.controllers) {
      const controller = project.controllers[controllerName];
      for (const route of controller.routes) {
        const method = route.method.toUpperCase();
        const fullRoute = joinRoute(controller.route, route.route);
        _println(`${method} ${fullRoute}`);
      }
    }
    _println();
  }
}

