import type { StyleSpecification } from 'maplibre-gl';

/**
 * Clean Light map style for Noctra.
 * Uses high-contrast, crystal-clear OpenStreetMap / CARTO light raster tiles for maximum legibility.
 */
export const lightMapStyle: StyleSpecification = {
  version: 8,
  name: 'Noctra Light',
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    // Base background
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#F4F5F8',
      },
    },
    // Clear, bright raster layer (crisp white roads, soft landmarks, clear labels)
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm-raster',
      paint: {
        'raster-opacity': 1.0,
      },
    },
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

// Alias for backwards compatibility
export const darkMapStyle: StyleSpecification = lightMapStyle;

/**
 * Fully offline fallback style — clean light background.
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
        'background-color': '#F4F5F8',
      },
    },
  ],
};
