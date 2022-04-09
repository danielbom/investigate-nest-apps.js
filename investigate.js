import caporal from "@caporal/core";
import { createEnvironmentFromProjectsWritter } from "./src/environments.js";
import { createDotFromProjects2Writter } from "./src/graph-02.js";
import { createDotFromProjectsWritter } from "./src/graph.js";
import { createPlanningFromProjectsWritter } from "./src/planning.js";
import { processManyProjects } from "./src/process.js";
import { createRoutingFromProjectsWritter } from "./src/routing.js";

const { program } = caporal;

program
  .version("1.0.0")
  .command(
    "run",
    "Execute the extraction of informations on directory of nest projects"
  )
  .option("--output <output>", "Output format", {
    default: "json",
    validator: ["dot:1", "dot:2", "planning", "environment", "routing", "json"],
  })
  .argument("<projectsPaths...>", "Many others of project paths", {
    validator: program.ARRAY,
  })
  .action(({ args, options }) => {
    const paths = Array.isArray(args.projectsPaths) ? args.projectsPaths : [];

    if (paths.length === 0) {
      process.exit(1);
    }

    const result = processManyProjects(paths);

    switch (options.output) {
      case "dot:1":
        createDotFromProjectsWritter(result);
        break;
      case "dot:2":
        createDotFromProjects2Writter(result);
        break;
      case "planning":
        createPlanningFromProjectsWritter(result);
        break;
      case "environment":
        createEnvironmentFromProjectsWritter(result);
        break;
      case "routing":
        createRoutingFromProjectsWritter(result);
        break;
      case "json":
        console.log(JSON.stringify(result, null, 2));
        break;
    }
  });

program.run(process.argv.slice(2));
