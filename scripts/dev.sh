#!/usr/bin/env bash
set -e

echo "Starting Noctra local development environment..."
pnpm --filter @noctra/web dev
