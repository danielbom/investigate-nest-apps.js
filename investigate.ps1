param ([Parameter(Mandatory)] [string] $Command)

switch ($Command)
{
  'Generate-Project-Json' {
    $output = '.\tmp\projects.json'
    echo "[INFO] Create $output"
    node .\index.js projects .. $output
  }
  'Generate-Project-Dot' {
    $output = '.\tmp\projects.dot'
    echo "[INFO] Create $output"
    node .\index.js projects-dot .. $output
    echo "[INFO] Create $output.png"
    dot -O -Tpng $output
  }
  'Generate-Project-Dot-02' {
    $output = '.\tmp\projects-02.dot'
    echo "[INFO] Create $output"
    node .\index.js "projects-dot-02" .. $output
    echo "[INFO] Create $output.png"
    dot -O -Tpng $output
  }
  'Generate-Project-Planning' {
    $output = '.\tmp\projects.md'
    echo "[INFO] Create $output"
    node .\index.js projects-planning .. $output
  }
  'Generate-Project-Routing' {
    $output = '.\tmp\projects-routing.txt'
    echo "[INFO] Create $output"
    node .\index.js projects-routing .. $output
  }
  'Generate-Project-Environments' {
    $output = '.\tmp\projects-environments.txt'
    echo "[INFO] Create $output"
    node .\index.js projects-environments .. $output
  }
  default {
    echo "Command not found: $Command"
  }
}
