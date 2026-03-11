/**
 * Application-wide constants.
 *
 * ⚠️  DEPENDENCY NOTES
 * ─────────────────────────────────────────────────────────────────────────────
 * chart.js (^4.5.1)
 *   Bundle impact: ~682 kB uncompressed, ~145 kB gzipped (lazy dashboard chunk).
 *   Only DoughnutController, ArcElement, Tooltip and Legend are tree-shaken in
 *   chart-card.component.ts via the explicit `Chart.register(...)` call.
 *   If chart variety grows, consider splitting charts into their own lazy routes
 *   or switching to a lighter alternative (e.g. uPlot, lightweight-charts).
 *
 * @angular/cdk + @angular/material (^21.2.x)
 *   Peer dependencies of Angular 21; kept in sync. Review at each major Angular
 *   upgrade.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Default fill colour used for new chart ranges. */
export const DEFAULT_RANGE_COLOR = '#4ADE80';

/** LocalStorage key namespace for persisted dashboard state. */
export const STORAGE_KEYS = {
  CHARTS: 'dashboard_custom_charts',
  ORDER: 'dashboard_chart_order',
} as const;

/** Interval (ms) between simulated WebSocket ticks. */
export const SOCKET_TICK_MS = 2_000;

/** Day labels used in the 7-day temperature trend chart. */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Sample temperature readings for the overview trend chart (°C). */
export const TREND_SAMPLE_DATA = [19.2, 20.1, 19.8, 21.3, 22.0, 21.5, 22.8] as const;

/** Primary brand colour used in Chart.js instances. */
export const BRAND_COLOR = '#4F6BED';

/** Semi-transparent brand colour for chart fills. */
export const BRAND_COLOR_ALPHA = 'rgba(79, 107, 237, 0.08)';

/** Y-axis lower bound for the temperature trend chart. */
export const TREND_Y_MIN = 15;

/** Y-axis upper bound for the temperature trend chart. */
export const TREND_Y_MAX = 28;

/** Standard dialog width presets (pixels). */
export const DIALOG_WIDTHS = {
  STANDARD: '620px',
  NARROW: '400px',
  WIDE: '1728px',
} as const;

/** Fixed dialog heights for add/edit vs list-view dialogs. */
export const DIALOG_HEIGHTS = {
  ADD_EDIT: '820px',
  LIST: '840px',
} as const;

/** Maximum dialog height as a viewport percentage (fallback). */
export const DIALOG_MAX_HEIGHT = '95vh';
