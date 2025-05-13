import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
// New utility functions added from the provided code

// Format percentage to rounded value with % sign
export const formatPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

// Alternative class name utility that joins strings
export const classNames = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; */