import type { StyleSpecification } from 'maplibre-gl';

/**
 * Dark map style for Noctra.
 * Uses a minimal style with no external tile sources for offline support.
 * When online, an optional raster OSM layer can be added.
 */
export const darkMapStyle: StyleSpecification = {
  version: 8,
  name: 'Noctra Dark',
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 18,
    },
  },
  layers: [
    // Base background
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#0F1419',
      },
    },
    // OSM raster layer with dark tint (only loads when online)
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm-raster',
      paint: {
        'raster-opacity': 0.35,
        'raster-brightness-max': 0.4,
        'raster-contrast': 0.3,
        'raster-saturation': -0.8,
      },
    },
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

/**
 * Fully offline fallback style — no external sources.
 */
export const offlineMapStyle: StyleSpecification = {
  version: 8,
  name: 'Noctra Offline',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#0F1419',
      },
    },
  ],
};
