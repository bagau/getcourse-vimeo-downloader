#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="getcourse-vimeo"

CONTAINER_IDS="$(docker ps -aq)"
if [[ -n "$CONTAINER_IDS" ]]; then
  echo "Removing all containers..."
  # shellcheck disable=SC2086
  docker rm -f $CONTAINER_IDS
else
  echo "No containers found."
fi

if docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
  echo "Removing image '$IMAGE_NAME'..."
  docker image rm -f "$IMAGE_NAME"
else
  echo "Image '$IMAGE_NAME' not found."
fi

echo "Cleanup finished."
