import { clsx, type ClassValue } from 'clsx';
import { customAlphabet } from 'nanoid';
import teamsData from '@/data/teams.json';
import type { Team } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export function generateRoomCode(): string {
  return nanoid();
}

export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return cr % 1 === 0 ? `${cr} Cr` : `${cr.toFixed(2)} Cr`;
  }
  return `${lakhs} L`;
}

export function formatPriceFull(lakhs: number): string {
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return cr % 1 === 0 ? `${cr} Crore` : `${cr.toFixed(2)} Crore`;
  }
  return `${lakhs} Lakhs`;
}

export function getTeamColor(teamId: string): { primary: string; secondary: string } {
  const team = (teamsData as Team[]).find((t) => t.id === teamId);
  return {
    primary: team?.primaryColor ?? '#6B7280',
    secondary: team?.secondaryColor ?? '#4B5563',
  };
}

export function getTeamById(teamId: string): Team | undefined {
  return (teamsData as Team[]).find((t) => t.id === teamId);
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
