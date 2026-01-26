import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertProjectNameToFileName(name: string) {
  if (!name || name.trim().length === 0) {
    return "untitled.frost";
  }

  if (!name.trim().includes(" ")) {
    return name.endsWith(".fr") ? name.trim() : `${name.trim()}.fr`;
  }

  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat(".fr");
}
