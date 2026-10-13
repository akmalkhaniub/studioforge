/**
 * StudioForge Cross-Platform Design Tokens (2026 OKLCH Palette)
 */
export const tokens = {
  colors: {
    bg: '#090a0f',
    surface: '#12141c',
    surfaceHover: '#1c1f2e',
    border: '#262a3f',
    primary: '#6366f1',
    primaryGlow: '#818cf8',
    secondary: '#ec4899',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textDim: '#64748b',
  },
  statusColors: {
    QUEUED: '#94a3b8',
    IN_PROGRESS: '#06b6d4',
    TRANSCODING: '#f59e0b',
    COMPLETED: '#10b981',
    FAILED: '#ef4444',
  },
  priorityColors: {
    VIP: '#ec4899',
    STANDARD: '#6366f1',
    BATCH: '#64748b',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    full: '9999px',
  },
} as const;

export type ThemeTokens = typeof tokens;
