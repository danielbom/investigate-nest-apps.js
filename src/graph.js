import fs from "fs";

import { println } from "./core/writter.js";

function hasKeys(obj) {
  return Object.keys(obj).length > 0;
}

const GRAPH_COLORS = [
  '"#ee00ee80"',
  '"#ff000080"',
  '"#eeee0080"',
  '"#00ff0080"',
  '"#00eeee80"',
  '"#0000ff80"',
];

export function createDotFromProjectsWritter(
  projects,
  writter = process.stdout
) {
  const _println = (text) => println(text, writter);
  let clusterCount = 0;
  let colorCount = 0;
  const getCluster = () => {
    const cluster = clusterCount;
    clusterCount++;
    return cluster;
  };
  const getColor = () => {
    const color = GRAPH_COLORS[colorCount];
    colorCount = (colorCount + 1) % GRAPH_COLORS.length;
    return color;
  };

  _println("digraph G {");
  {
    _println("  compound = true;");
    _println('  fontname = "Helvetica,Arial,sans-serif";');
    _println('  node [fontname="Helvetica,Arial,sans-serif"];');
    _println('  edge [fontname="Helvetica,Arial,sans-serif"];');
    _println();

    for (const projectName in projects) {
      const project = projects[projectName];

      if (hasKeys(project.controllers)) {
        const cluster = getCluster();
        _println(`  subgraph cluster_${cluster} {`);
        {
          _println(`    label = "${projectName}";`);
          _println("    style = filled;");
          _println(`    color = ${getColor()};`);
          _println("    node[style = filled];");
          _println(`    "${projectName}" [label = "", style = invisible];`);

          for (const controllerName in project.controllers) {
            const controller = project.controllers[controllerName];
            for (const dependency of controller.dependencies) {
              _println(
                `    "${cluster}.${dependency}" -> "${cluster}.${controllerName}";`
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
