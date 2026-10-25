import React from 'react';
import type { Evidence, EvidenceLabel } from '@noctra/contracts';
import { Check, Clock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatAge } from '@/lib/format';

export interface EvidenceChipProps {
  evidence?: Evidence;
  label?: EvidenceLabel;
  status?: EvidenceLabel | string;
  age?: string;
  source?: string;
  value?: string;
  subject?: string;
  onClick?: () => void;
  className?: string;
}

function HalfFilledCircle({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3 w-3 shrink-0', className)} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2 A 6 6 0 0 1 8 14 Z" fill="currentColor" />
    </svg>
  );
}

const LABEL_STYLES: Record<
  EvidenceLabel,
  {
    icon: React.FC<{ className?: string }>;
    textClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  KNOWN: {
    icon: Check,
    textClass: 'text-[#0F766E]',
    bgClass: 'bg-[#E6F4F1]',
    borderClass: 'border-[#0F766E]/30',
  },
  PROBABLE: {
    icon: HalfFilledCircle,
    textClass: 'text-[#1D5FA8]',
    bgClass: 'bg-[#E8F0FA]',
    borderClass: 'border-[#1D5FA8]/30',
  },
  OUTDATED: {
    icon: Clock,
    textClass: 'text-[#8A5A00]',
    bgClass: 'bg-[#FBF1DC]',
    borderClass: 'border-[#8A5A00]/30',
  },
  UNKNOWN: {
    icon: HelpCircle,
    textClass: 'text-[#5E5780]',
    bgClass: 'bg-[#EEECF5]',
    borderClass: 'border-dashed border-[#5E5780]/40',
  },
};

export function EvidenceChip({
  evidence,
  label: propLabel,
  status: propStatus,
  age: propAge,
  source: propSource,
  value: propValue,
  subject: propSubject,
  onClick,
  className,
}: EvidenceChipProps) {
  const resolvedLabel: EvidenceLabel =
    propLabel || (propStatus as EvidenceLabel) || evidence?.label || 'UNKNOWN';
  const resolvedAge = propAge || (evidence ? formatAge(evidence.age_s) : undefined);
  const resolvedSource = propSource || evidence?.source;
  const resolvedSubject = propSubject || evidence?.subject;
  const resolvedValue = propValue;

  const style = LABEL_STYLES[resolvedLabel];
  const Icon = style.icon;

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border select-none transition-colors',
        style.bgClass,
        style.textClass,
        style.borderClass,
        onClick && 'cursor-pointer hover:opacity-85',
        className
      )}
      title={[
        resolvedSubject,
        resolvedLabel,
        resolvedSource && `via ${resolvedSource}`,
        resolvedAge && `(${resolvedAge})`,
      ]
        .filter(Boolean)
        .join(' — ')}
    >
      <Icon className="h-3 w-3 shrink-0 stroke-[2]" />
      <span className={cn('font-semibold', resolvedLabel === 'OUTDATED' && resolvedValue && 'line-through')}>
        {resolvedSubject ? `${resolvedSubject}: ${resolvedLabel}` : resolvedLabel}
      </span>
      {resolvedAge && (
        <span className="opacity-75 text-[11px] font-mono">
          {resolvedAge}
        </span>
      )}
      {resolvedSource && (
        <span className="opacity-75 text-[10px] hidden sm:inline">
          • {resolvedSource}
        </span>
      )}
    </Component>
  );
}
