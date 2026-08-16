/**
 * Accent palette, in hex, for the places that need a real colour value at
 * runtime — inline `style` props, canvas fills, SVG gradients.
 *
 * These must stay in sync with the `--c-*` / `--s-bg` custom properties in
 * `app/globals.css`, which is where Tailwind's `cyber-green`, `cyber-blue`,
 * `travel-amber` and `dark-bg` classes read from. Change both together.
 */
export const accent = {
    green: "#34e78f",
    blue: "#38c7ff",
    amber: "#fbb040",
    orange: "#fb8c3c",
    /** Page background — used where a swatch needs to punch a hole. */
    bg: "#080a0e",
} as const;

export type AccentColor = (typeof accent)[keyof typeof accent];
