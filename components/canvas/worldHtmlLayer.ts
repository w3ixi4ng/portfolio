/**
 * One fixed DOM container for every in-world label. drei's <Html> otherwise mounts into
 * `events.connected || canvas parent`; that target changes once R3F connects events,
 * which recreates the label's React root without re-rendering its children (the first
 * labels mounted came up empty). A stable portal avoids that.
 */
export const worldHtmlLayer: { current: HTMLDivElement | null } = { current: null };
