import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, handling conflicts intelligently.
 * @param {...import("clsx").ClassValue} inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
