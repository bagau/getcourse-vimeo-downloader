#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="getcourse-vimeo"

docker build -t "$IMAGE_NAME" "$PROJECT_ROOT"
echo "Docker image '$IMAGE_NAME' is ready."
