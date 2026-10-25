import { describe, it, expect } from 'vitest';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('WCAG AA Contrast Verification', () => {
  const bg = '#0F1419';
  const text = '#E8EDF2';
  const muted = '#9AA7B4';
  const accent = '#F2B54A';
  const known = '#4FD1B5';

  it('verifies primary text against background exceeds WCAG AA (4.5:1)', () => {
    const ratio = getContrastRatio(text, bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('verifies muted text against background exceeds WCAG AA for large/UI (3.0:1)', () => {
    const ratio = getContrastRatio(muted, bg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it('verifies amber accent against background exceeds WCAG AA (4.5:1)', () => {
    const ratio = getContrastRatio(accent, bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('verifies teal known status against background exceeds WCAG AA (4.5:1)', () => {
    const ratio = getContrastRatio(known, bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
