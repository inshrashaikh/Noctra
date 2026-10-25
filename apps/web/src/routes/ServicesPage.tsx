import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { planService } from '@/services';
import type { Service } from '@noctra/contracts';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import {
  ShieldAlert,
  Cross,
  Pill,
  Fuel,
  Bus,
  Search,
  Check,
  CircleDot,
  Clock,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const KIND_CONFIG: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  hospital: { label: 'Hospital & Emergency', icon: Cross },
  pharmacy: { label: '24h Pharmacy', icon: Pill },
  police: { label: 'Police Station / Help', icon: ShieldAlert },
  fuel: { label: 'Fuel / EV Charging', icon: Fuel },
  transit: { label: 'Transit Interchange', icon: Bus },
};

export function ServicesPage() {
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['all-services'],
    queryFn: async () => {
      return planService.getServices({
        lat: 21.0944,
        lon: 79.0558,
        radius_m: 5000,
      });
    },
  });

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesKind = selectedKind === 'all' || s.kind === selectedKind;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesKind && matchesSearch;
    });
  }, [services, selectedKind, searchQuery]);

  return (
    <div className="flex flex-1 flex-col bg-noctra-bg text-noctra-text">
      {/* Page Header */}
      <section className="border-b border-noctra-border bg-noctra-surface py-6">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-noctra-text">
                  Essential Night Services
                </h1>
                <SimulatedBadge size="sm" />
              </div>
              <p className="mt-1 text-xs text-noctra-muted max-w-2xl">
                Verified 24/7 medical centers, pharmacies, police assistance desks, and lit transit points within 5 km of the primary night corridor. Environmental risk proxy (not crime data).
              </p>
            </div>
            <div className="font-mono text-xs text-noctra-muted">
              {filteredServices.length} of {services.length} services listed
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'hospital', label: 'Hospitals' },
                { id: 'pharmacy', label: 'Pharmacies' },
                { id: 'police', label: 'Police / Help' },
                { id: 'fuel', label: 'Fuel / EV' },
                { id: 'transit', label: 'Transit' },
              ].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedKind(category.id)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    selectedKind === category.id
                      ? 'bg-noctra-accent text-noctra-bg'
                      : 'bg-noctra-raised text-noctra-muted hover:text-noctra-text'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-noctra-muted" />
              <input
                type="text"
                placeholder="Filter services by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-noctra-border bg-noctra-bg pl-8 pr-3 text-xs text-noctra-text placeholder:text-noctra-dim focus:border-noctra-accent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <div className="mx-auto flex-1 w-full max-w-[1280px] px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-noctra-muted">
            Loading verified night services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center text-xs text-noctra-muted">
            No essential services found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const kindInfo = KIND_CONFIG[service.kind] || {
                label: service.kind,
                icon: MapPin,
              };
              const Icon = kindInfo.icon;

              return (
                <div
                  key={service.id}
                  className="flex flex-col justify-between rounded-md border border-noctra-border bg-noctra-surface p-4 space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-noctra-muted">
                        <Icon className="h-3.5 w-3.5 text-noctra-accent" />
                        <span>{kindInfo.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-noctra-muted">
                        {(service.distance_m / 1000).toFixed(1)} km away
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-semibold text-noctra-text">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-xs text-noctra-muted">
                      Source: {service.source}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-noctra-border/60 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-noctra-text">
                      <Clock className="h-3 w-3 text-noctra-muted" />
                      <span>{service.hours_label || '24×7'}</span>
                    </span>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold',
                        service.label === 'KNOWN'
                          ? 'bg-noctra-known/10 text-noctra-known border border-noctra-known/40'
                          : service.label === 'PROBABLE'
                          ? 'bg-noctra-probable/10 text-noctra-probable border border-noctra-probable/40'
                          : service.label === 'OUTDATED'
                          ? 'bg-noctra-outdated/10 text-noctra-outdated border border-noctra-outdated/40'
                          : 'bg-noctra-unknown/10 text-noctra-unknown border border-noctra-unknown/40'
                      )}
                    >
                      {service.label === 'KNOWN' && <Check className="h-2.5 w-2.5" />}
                      {service.label === 'PROBABLE' && <CircleDot className="h-2.5 w-2.5" />}
                      {service.label === 'OUTDATED' && <Clock className="h-2.5 w-2.5" />}
                      {service.label === 'UNKNOWN' && <HelpCircle className="h-2.5 w-2.5" />}
                      <span>{service.label}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
