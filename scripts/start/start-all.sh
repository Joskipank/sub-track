#!/usr/bin/env sh
echo "Starting SubTrack stack..."
docker compose -f infra/docker-compose.yml up -d
