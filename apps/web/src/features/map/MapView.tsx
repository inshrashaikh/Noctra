import { useCallback, useState } from 'react';
import Map, {
  Source,
  Layer,
  Marker,
  NavigationControl,
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Plus, Hospital, Shield, Fuel, Pill } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NAGPUR_CENTER } from '@/lib/geo';
import { lightMapStyle } from './mapStyle';
import type { Candidate, Service } from '@noctra/contracts';

interface MapViewProps {
  candidates?: Candidate[];
  selectedId?: string | null;
  services?: Service[];
  origin?: { lat: number; lon: number } | null;
  destination?: { lat: number; lon: number } | null;
  onMapClick?: (lat: number, lon: number) => void;
  className?: string;
}

const SERVICE_ICONS: Record<string, typeof Hospital> = {
  hospital: Hospital,
  pharmacy: Pill,
  police: Shield,
  fuel: Fuel,
};

const ROUTE_COLORS: Record<string, string> = {
  fastest: '#D97706',
  balanced: '#2563EB',
  safest: '#059669',
};

export function MapView({
  candidates = [],
  selectedId,
  services = [],
  origin,
  destination,
  onMapClick,
  className,
}: MapViewProps) {
  const [viewState, setViewState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  }>({
    longitude: NAGPUR_CENTER.lon,
    latitude: NAGPUR_CENTER.lat,
    zoom: 13,
  });

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      onMapClick?.(e.lngLat.lat, e.lngLat.lng);
    },
    [onMapClick]
  );

  const handleMove = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  return (
    <div className={cn('relative h-full w-full bg-[#F4F5F8]', className)}>
      <Map
        {...viewState}
        onMove={handleMove}
        onClick={handleClick}
        mapStyle={lightMapStyle as any}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Route lines */}
        {candidates.map((candidate) => {
          const isSelected = candidate.id === selectedId;
          const isRejected = candidate.rejected;
          return (
            <Source
              key={candidate.id}
              id={`route-${candidate.id}`}
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: candidate.geometry,
              }}
            >
              <Layer
                id={`route-line-${candidate.id}`}
                type="line"
                paint={{
                  'line-color': isRejected
                    ? '#94A3B8'
                    : ROUTE_COLORS[candidate.kind] ?? '#D97706',
                  'line-width': isSelected ? 5 : 3,
                  'line-opacity': isSelected ? 1 : isRejected ? 0.35 : 0.75,
                  'line-dasharray': isRejected ? [2, 4] : [1],
                }}
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
              />
            </Source>
          );
        })}

        {/* Origin marker */}
        {origin && (
          <Marker longitude={origin.lon} latitude={origin.lat} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-[#12233A] text-white p-1.5 shadow-md border-2 border-white">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="mt-1 text-[11px] font-bold text-[#14181D] bg-white px-2 py-0.5 rounded shadow-sm border border-[#E2DED3]">
                Start
              </span>
            </div>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            longitude={destination.lon}
            latitude={destination.lat}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-[#EA580C] text-white p-1.5 shadow-md border-2 border-white">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="mt-1 text-[11px] font-bold text-[#14181D] bg-white px-2 py-0.5 rounded shadow-sm border border-[#E2DED3]">
                Home
              </span>
            </div>
          </Marker>
        )}

        {/* Service markers */}
        {services.map((service) => {
          const Icon = SERVICE_ICONS[service.kind] ?? Plus;
          return (
            <Marker
              key={service.id}
              longitude={service.lon}
              latitude={service.lat}
              anchor="center"
            >
              <div
                className="rounded-full border border-[#C9C4B6] bg-white p-1 shadow-sm hover:scale-110 transition-transform"
                title={`${service.name} (${service.kind})`}
              >
                <Icon className="h-3.5 w-3.5 text-[#12233A]" />
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Map attribution */}
      <div className="absolute bottom-1 left-1 rounded bg-white/80 backdrop-blur-xs px-2 py-0.5 text-[10px] text-[#5B6672] border border-[#E2DED3]">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
