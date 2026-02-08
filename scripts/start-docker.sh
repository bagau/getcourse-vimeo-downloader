#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="getcourse-vimeo"
CONTAINER_NAME="getcourse-vimeo-downloader"
VIDEOS_DIR="$PROJECT_ROOT/videos"

mkdir -p "$VIDEOS_DIR"

if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
  echo "Docker image '$IMAGE_NAME' not found. Run ./scripts/init-docker.sh first."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

docker run --rm \
  --name "$CONTAINER_NAME" \
  --user "$(id -u):$(id -g)" \
  -p "3000:3000" \
  -v "${VIDEOS_DIR}:/app/videos" \
  "$IMAGE_NAME"
