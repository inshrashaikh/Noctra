#!/usr/bin/env bash
set -e

echo "=== Running Noctra Quality Checks ==="

echo "1. Checking TypeScript Types..."
pnpm typecheck

echo "2. Running Linter..."
pnpm lint

echo "3. Running Unit Tests..."
pnpm test

echo "4. Building Packages & Apps..."
pnpm build

echo "=== All checks passed! ==="
