import fs from "fs";

import { println } from "./core/writter.js";

export function createPlanningFromProjectsWritter(
  projects,
  writter = process.stdout
) {
  const _println = (text) => println(text, writter);

  for (const projectName in projects) {
    _println(`* [ ] ${projectName}`);
    const project = projects[projectName];
    for (const controllerName in project.controllers) {
      _println(`  * [ ] ${controllerName}`);
    }
    _println();
  }
}

export function createPlanningFromProjects(projects, outputPath) {
  const fileWritter = fs.createWriteStream(outputPath);
  createPlanningFromProjectsWritter(projects, fileWritter);
  fileWritter.close();
}
