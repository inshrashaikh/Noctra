# Noctra Offline & Geo Data Assets

This directory contains offline data assets and manifests for Nagpur night routing.

## Contents

- `MANIFEST.json`: Data provenance manifest defining source timestamps, OSM extraction bounds, and model versions.
- `nagpur-graph.geojson`: Offline road network graph for Nagpur urban agglomeration.
- `facilities.geojson`: GeoJSON dataset of 24×7 hospitals, all-night pharmacies, police stations, and fuel kiosks.

## Honesty Principle

All datasets stored locally are versioned with an extraction timestamp. If an asset exceeds its TTL without an update, facts derived from it are degraded from `KNOWN` to `OUTDATED`.
