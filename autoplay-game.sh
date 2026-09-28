#!/usr/bin/env bash
#
# run-game.sh — play the whole game and watch it go.
#
#   ./run-game.sh                 the full run, about two minutes
#   ./run-game.sh --slow --pause  stage by stage, on the ENTER key
#   ./run-game.sh --stage 18      just Act V
#   ./run-game.sh --fast --quiet  the score history in a few seconds
#   ./run-game.sh --browser       open the game and hand you the route to paste
#   ./run-game.sh --help          every option
#
# Everything after the script name goes straight to tools/play.js.

set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "run-game.sh: node is not on the PATH — install Node and try again." >&2
  exit 1
fi

# --browser plays it in the real thing instead: the game has a batch box, so
# write the route out, open index.html, and let the map and the plates move too.
if [ "${1:-}" = "--browser" ]; then
  shift
  route="$(pwd)/route.txt"
  node tools/play.js --batch "$route"
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy < "$route"
    echo "The route is on the clipboard. Click the command box and paste."
  else
    echo "Open $route, copy the lot, and paste it into the command box."
  fi
  if command -v open >/dev/null 2>&1; then open index.html
  else echo "Open index.html in a browser."; fi
  exit 0
fi

exec node tools/play.js "$@"
