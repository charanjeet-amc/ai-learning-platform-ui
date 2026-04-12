import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getMasteryColor(score: number): string {
  if (score >= 0.8) return 'text-green-500';
  if (score >= 0.5) return 'text-yellow-500';
  if (score >= 0.3) return 'text-orange-500';
  return 'text-red-500';
}

export function getMasteryLabel(score: number): string {
  if (score >= 0.9) return 'Mastered';
  if (score >= 0.7) return 'Proficient';
  if (score >= 0.5) return 'Developing';
  if (score >= 0.3) return 'Emerging';
  return 'Not Started';
}

export function getDifficultyColor(level: string): string {
  switch (level) {
    case 'BEGINNER': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'INTERMEDIATE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'ADVANCED': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    case 'EXPERT': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700';
  }
}
