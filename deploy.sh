#!/bin/bash
set -euo pipefail

git reset --hard
git checkout main
git pull origin main

docker compose -f docker-compose.production.yml --env-file .env.production up -d --build --progress=plain
