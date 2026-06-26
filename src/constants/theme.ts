export const THEME = {
  colors: {
    primary: '#2D6A4F',
    primaryLight: '#40916C',
    primaryDark: '#1B4332',
    accent: '#E9C46A',
    accentDark: '#F4A261',

    indoorSow: '#C084FC',
    directSow: '#FB923C',
    plantOut: '#4ADE80',
    harvest: '#F87171',

    background: '#FAF9F6',
    surface: '#FFFFFF',
    text: '#1C1917',
    textSecondary: '#78716C',
    border: '#E7E5E4',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
} as const;

export const VEGETABLE_COLORS = [
  '#E76F51', '#F4A261', '#E9C46A', '#2A9D8F',
  '#287271', '#8ECAE6', '#219EBC', '#126782',
  '#FFB703', '#FB8500', '#8338EC', '#FF006E',
  '#3A86FF', '#9C89B8', '#F08080', '#70A288',
  '#D5896F', '#7E998A', '#A663CC', '#FFCDB2',
  '#6D597A', '#B56576', '#EAAC8B', '#355070',
  '#E56B6F', '#355070', '#6D597A', '#B56576',
] as const;

/** Plot background — used as the blend target for muted vegetable colours. */
const PLOT_BACKGROUND = '#F5F0E8';

/**
 * Blend a foreground hex colour with the plot background to produce a muted,
 * pastel equivalent. The default ratio matches the current 0.45-opacity
 * "non-harvest" look the user prefers.
 */
export function muteColor(
  hex: string,
  backgroundHex: string = PLOT_BACKGROUND,
  ratio: number = 0.45,
): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const br = parseInt(backgroundHex.slice(1, 3), 16);
  const bg = parseInt(backgroundHex.slice(3, 5), 16);
  const bb = parseInt(backgroundHex.slice(5, 7), 16);

  const mr = Math.round(r * ratio + br * (1 - ratio));
  const mg = Math.round(g * ratio + bg * (1 - ratio));
  const mb = Math.round(b * ratio + bb * (1 - ratio));

  return `#${mr.toString(16).padStart(2, '0')}${mg.toString(16).padStart(2, '0')}${mb.toString(16).padStart(2, '0')}`;
}

/**
 * Deterministic colour picker for a variety id. Returns a muted version of
 * one of the {@link VEGETABLE_COLORS} palette entries.
 */
export function getMutedVegColor(varietyId: string): string {
  let hash = 0;
  for (let i = 0; i < varietyId.length; i++) {
    hash = varietyId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bright = VEGETABLE_COLORS[Math.abs(hash) % VEGETABLE_COLORS.length];
  return muteColor(bright);
}
