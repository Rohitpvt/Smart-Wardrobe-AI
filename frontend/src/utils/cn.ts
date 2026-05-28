/**
 * Smart Wardrobe AI — className merge utility
 *
 * Combines multiple class name strings, filtering out falsy values.
 * Lightweight alternative to `clsx` or `classnames` packages.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
