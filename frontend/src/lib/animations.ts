export const BASE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1
} as const;

export const FAST_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 1
} as const;

export const BOUNCE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 15,
  mass: 1
} as const;
