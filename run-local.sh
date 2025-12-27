#!/usr/bin/env bash
IMAGE="ghcr.io/3ffon/shoppi:latest"

docker pull --platform=linux/amd64 "$IMAGE"
docker run --rm --platform=linux/amd64 -p 3000:3000 -v $(pwd)/db.json:/app/db.json -e DB_PATH="./db.json" "$IMAGE"