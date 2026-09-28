export interface GrupoMuscularTone {
  color: string;
  bg: string;
  border: string;
}

const PALETTE: GrupoMuscularTone[] = [
  { color: '#4BBF5C', bg: 'rgba(75, 191, 92, 0.16)', border: 'rgba(75, 191, 92, 0.45)' },
  { color: '#4da3ff', bg: 'rgba(77, 163, 255, 0.16)', border: 'rgba(77, 163, 255, 0.45)' },
  { color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.16)', border: 'rgba(255, 170, 0, 0.45)' },
  { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.16)', border: 'rgba(192, 132, 252, 0.45)' },
  { color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.16)', border: 'rgba(34, 211, 238, 0.45)' },
  { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.16)', border: 'rgba(251, 113, 133, 0.45)' },
  { color: '#facc15', bg: 'rgba(250, 204, 21, 0.16)', border: 'rgba(250, 204, 21, 0.45)' },
  { color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.16)', border: 'rgba(45, 212, 191, 0.45)' },
];

const NAMED_INDEX: Record<string, number> = {
  pecho: 5,
  pectoral: 5,
  pectorales: 5,
  espalda: 1,
  dorsales: 1,
  hombros: 2,
  hombro: 2,
  deltoides: 2,
  biceps: 4,
  triceps: 3,
  piernas: 0,
  pierna: 0,
  cuadriceps: 0,
  femoral: 7,
  femorales: 7,
  isquiotibiales: 7,
  gluteos: 5,
  gluteo: 5,
  abdomen: 6,
  abdominales: 6,
  core: 6,
  pantorrilla: 7,
  pantorrillas: 7,
  gemelos: 7,
  antebrazo: 2,
  antebrazos: 2,
  trapecio: 1,
  trapecios: 1,
};

function normalizeName(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function hashName(nombre: string): number {
  let hash = 0;
  for (const char of nombre) {
    hash = (hash * 31 + char.charCodeAt(0)) % PALETTE.length;
  }
  return hash;
}

export function grupoMuscularTone(nombre: string): GrupoMuscularTone {
  const key = normalizeName(nombre);
  const named = NAMED_INDEX[key];
  const index = named ?? hashName(key);
  return PALETTE[index] ?? PALETTE[0];
}
