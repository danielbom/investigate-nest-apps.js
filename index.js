import fs from "fs";

import { createDotFromProjects } from "./src/graph.js";
import { createPlanningFromProjects } from "./src/planning.js";
import { createRoutingFromProjects } from "./src/routing.js";
import { getEnvironmentsFromProjects } from "./src/environments.js";
import {
  processManyProjects,
  processOneFile,
  processOneProject,
} from "./src/process.js";

function outputAsJson(result, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), {
    encoding: "utf-8",
  });
}

function executeCommand({ command, pathname, outputPath }) {
  switch (command) {
    case "projects-environments":
      outputAsJson(getEnvironmentsFromProjects(pathname), outputPath);
      break;
    case "projects-planning":
      createPlanningFromProjects(processManyProjects(pathname), outputPath);
      break;
    case "projects-routing":
      createRoutingFromProjects(processManyProjects(pathname), outputPath);
      break;
    case "projects-dot":
      createDotFromProjects(processManyProjects(pathname), outputPath);
      break;
    case "projects":
      outputAsJson(processManyProjects(pathname), outputPath);
      break;
    case "project":
      outputAsJson(processOneProject(pathname), outputPath);
      break;
    case "file":
      outputAsJson(processOneFile(pathname), outputPath);
      break;
    default:
      throw new Error("Invalid command: " + command);
  }
}

function main(args) {
  const usage = `Usage: node program.js [subcommand] [path] [output]
  subcommand: "file" | "project" | "projects"
  path: string
`;
  if (args.length < 3)
    throw new Error("Invalid number of arguments!\n" + usage);

  executeCommand({
    command: args[0],
    pathname: args[1],
    outputPath: args[2],
  });
}

main(process.argv.slice(2));
