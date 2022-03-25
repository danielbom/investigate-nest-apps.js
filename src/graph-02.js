import { println } from "./core/writter.js";

function hasKeys(obj) {
  return Object.keys(obj).length > 0;
}

class Counter {
  constructor(value = 0) {
    this.value = value;
  }

  next() {
    const nextValue = this.value;
    this.value++;
    return nextValue;
  }
}

function createCounter(value = 0) {
  return new Counter(value);
}

function getColorByClassName(className) {
  if (className.endsWith("Controller")) {
    return 'color = "#ff0000",fontcolor = "#ffffff"';
  }
  if (className.endsWith("Service")) {
    return 'color = "#ffff00"';
  }
  if (className.endsWith("Repository")) {
    return 'color = "#0000ff",fontcolor = "#ffffff"';
  }
  if (className.endsWith("Middleware")) {
    return 'color = "#00ff00"';
  }
  return 'color = "#000000",fontcolor = "#ffffff"';
}

function getRankByClassName(className) {
  if (className.endsWith("Controller")) return "rank = 1";
  if (className.endsWith("Service")) return "rank = 2";
  if (className.endsWith("Repository")) return "rank = 3";
  return "rank = 9";
}

export function createDotFromProjects2Writter(
  projects,
  writter = process.stdout
) {
  const _println = (text) => println(text, writter);
  const clusterCount = createCounter();

  _println("digraph G {");
  {
    _println("  concentrate = true;")
    _println("  compound = true;");
    _println('  fontname = "Helvetica,Arial,sans-serif";');
    _println('  node [fontname="Helvetica,Arial,sans-serif"];');
    _println('  edge [fontname="Helvetica,Arial,sans-serif"];');
    _println();

    for (const projectName in projects) {
      const project = projects[projectName];

      if (hasKeys(project.controllers)) {
        const cluster = clusterCount.next();
        _println(`  subgraph cluster_${cluster} {`);
        {
          _println(`    label = "${projectName}";`);
          _println("    style = filled;");
          _println("    node [style = filled];");
          _println(`    "${projectName}" [label = "", style = invisible];`);

          const classes = new Set();

          Object.keys(project.injectables)
            .concat(Object.keys(project.controllers))
            .forEach((key) => {
              const cls = project.injectables[key] || project.controllers[key];
              classes.add(key);
              cls.dependencies.forEach((x) => classes.add(x));
            });

          for (const className of classes) {
            const classRank = getRankByClassName(className);
            const classColor = getColorByClassName(className);
            const classColorSep = classColor ? ", " + classColor : "";
            _println(
              `    "${cluster}.${className}" [${classRank}${classColorSep}];`
            );
          }

          for (const className in project.controllers) {
            const controller = project.controllers[className];
            for (const dependency of controller.dependencies) {
              _println(
                `    "${cluster}.${className}" -> "${cluster}.${dependency}";`
              );
            }
          }

          for (const className in project.injectables) {
            const injectable = project.injectables[className];
            for (const dependency of injectable.dependencies) {
              _println(
                `    "${cluster}.${className}" -> "${cluster}.${dependency}";`
              );
            }
          }
        }
        _println("  }");
      }
    }
  }
  _println("}");
}
