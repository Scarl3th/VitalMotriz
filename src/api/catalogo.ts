import { supabase } from '../lib/supabase';
import type { EjercicioCatalogo, GrupoMuscular } from '../types';

interface GrupoRelRow {
  grupos_musculares: GrupoMuscular | GrupoMuscular[] | null;
}

interface EjercicioCatalogoRow {
  id_ejercicio: number;
  nombre_ejercicio: string;
  descripcion: string | null;
  ejercicio_grupo_muscular: GrupoRelRow[] | null;
}

function asOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapEjercicio(row: EjercicioCatalogoRow): EjercicioCatalogo {
  const grupos = (row.ejercicio_grupo_muscular ?? [])
    .map((rel) => asOne(rel.grupos_musculares))
    .filter((grupo): grupo is GrupoMuscular => grupo !== null);

  return {
    id_ejercicio: row.id_ejercicio,
    nombre_ejercicio: row.nombre_ejercicio,
    descripcion: row.descripcion,
    grupos_musculares: grupos,
  };
}

export async function listGruposMusculares(): Promise<GrupoMuscular[]> {
  const { data, error } = await supabase
    .from('grupos_musculares')
    .select('id_grupo_muscular, nombre')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data ?? []) as GrupoMuscular[];
}

export async function createGrupoMuscular(nombre: string): Promise<GrupoMuscular> {
  const { data, error } = await supabase
    .from('grupos_musculares')
    .insert({ nombre })
    .select('id_grupo_muscular, nombre')
    .single();

  if (error) throw error;
  return data as GrupoMuscular;
}

export async function updateGrupoMuscular(id: number, nombre: string): Promise<GrupoMuscular> {
  const { data, error } = await supabase
    .from('grupos_musculares')
    .update({ nombre })
    .eq('id_grupo_muscular', id)
    .select('id_grupo_muscular, nombre')
    .single();

  if (error) throw error;
  return data as GrupoMuscular;
}

export async function deleteGrupoMuscular(id: number): Promise<void> {
  const { error } = await supabase.from('grupos_musculares').delete().eq('id_grupo_muscular', id);
  if (error) throw error;
}

export async function listEjerciciosCatalogo(): Promise<EjercicioCatalogo[]> {
  const { data, error } = await supabase
    .from('ejercicios')
    .select(
      `
      id_ejercicio,
      nombre_ejercicio,
      descripcion,
      ejercicio_grupo_muscular (
        grupos_musculares (
          id_grupo_muscular,
          nombre
        )
      )
    `,
    )
    .order('nombre_ejercicio', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as EjercicioCatalogoRow[]).map(mapEjercicio);
}

async function syncEjercicioGrupos(idEjercicio: number, idGrupos: number[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('ejercicio_grupo_muscular')
    .delete()
    .eq('id_ejercicio', idEjercicio);
  if (deleteError) throw deleteError;

  if (idGrupos.length === 0) return;

  const { error } = await supabase.from('ejercicio_grupo_muscular').insert(
    idGrupos.map((idGrupo) => ({
      id_ejercicio: idEjercicio,
      id_grupo_muscular: idGrupo,
    })),
  );
  if (error) throw error;
}

export async function createEjercicioCatalogo(input: {
  nombre_ejercicio: string;
  descripcion: string | null;
  id_grupos: number[];
}): Promise<void> {
  const { data, error } = await supabase
    .from('ejercicios')
    .insert({
      nombre_ejercicio: input.nombre_ejercicio,
      descripcion: input.descripcion,
    })
    .select('id_ejercicio')
    .single();

  if (error) throw error;
  await syncEjercicioGrupos(data.id_ejercicio as number, input.id_grupos);
}

export async function updateEjercicioCatalogo(
  id: number,
  input: {
    nombre_ejercicio: string;
    descripcion: string | null;
    id_grupos: number[];
  },
): Promise<void> {
  const { error } = await supabase
    .from('ejercicios')
    .update({
      nombre_ejercicio: input.nombre_ejercicio,
      descripcion: input.descripcion,
    })
    .eq('id_ejercicio', id);

  if (error) throw error;
  await syncEjercicioGrupos(id, input.id_grupos);
}

export async function deleteEjercicioCatalogo(id: number): Promise<void> {
  const { error } = await supabase.from('ejercicios').delete().eq('id_ejercicio', id);
  if (error) throw error;
}
