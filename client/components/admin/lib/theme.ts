/** Neo-brutalist palette classes used across admin UI */
export const adminColors = {
  acid: 'bg-[var(--acid)] text-[var(--ink)]',
  electric: 'bg-[var(--electric)] text-white',
  hotpink: 'bg-[var(--hotpink)] text-white',
  sunset: 'bg-[var(--sunset)] text-white',
  ink: 'bg-[var(--ink)] text-white',
  white: 'bg-white text-[var(--ink)]',
  muted: 'bg-[var(--muted)] text-[var(--ink)]',
} as const;

const THEME_MAP: Record<string, string> = {
  'bg-on-background': adminColors.electric,
  'bg-tertiary-container': adminColors.acid,
  'bg-primary-fixed-dim': adminColors.sunset,
  'bg-white': adminColors.white,
  'bg-error': adminColors.hotpink,
  'bg-secondary': adminColors.muted,
  'bg-on-surface-variant': adminColors.muted,
};

const ROTATION = [
  adminColors.acid,
  adminColors.electric,
  adminColors.hotpink,
  adminColors.sunset,
];

/** Normalize DB themeColor / legacy MD3 class names to project palette */
export function resolveAuctionTheme(themeColor?: string, index = 0): string {
  if (!themeColor) return ROTATION[index % ROTATION.length];
  if (themeColor.startsWith('bg-[var(--')) return themeColor.includes('text-') ? themeColor : `${themeColor} text-[var(--ink)]`;
  if (THEME_MAP[themeColor]) return THEME_MAP[themeColor];
  if (themeColor.startsWith('bg-[#')) return `${themeColor} text-[var(--ink)]`;
  return ROTATION[index % ROTATION.length];
}
