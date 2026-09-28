import type { EstadoRutina } from '../types';

function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatDate(value: string | null | undefined): string {
  const date = parseDateOnly(value);
  if (!date) return value || '—';
  return date.toLocaleDateString('es-CL');
}

export function formatDateLong(value: string | null | undefined): string {
  const date = parseDateOnly(value);
  if (!date) return value || '—';
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ageFromBirthdate(value: string | null | undefined): number | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

export function formatEstado(estado: EstadoRutina): string {
  if (estado === 'activa') return 'Activa';
  if (estado === 'completada') return 'Completada';
  return 'Inactiva';
}

export function clienteNombreCompleto(nombre: string, apellido: string | null): string {
  return [nombre, apellido].filter(Boolean).join(' ');
}

function escapeIlike(value: string): string {
  return value.replace(/[%_,]/g, '').trim();
}

export function sanitizeSearch(value: string): string {
  return escapeIlike(value);
}

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}
