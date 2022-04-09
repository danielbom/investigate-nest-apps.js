export function println(text = "", writter = process.stdout) {
  writter.write(text + "\n");
}

