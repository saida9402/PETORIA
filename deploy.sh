#!/bin/bash

git reset --hard
git checkout main
git pull origin main

docker compose -f docker-compose.production.yml up -d --build