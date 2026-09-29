import { supabase } from '../lib/supabase';
import type {
  DiaRutina,
  Ejercicio,
  EjercicioRutina,
  GrupoMuscular,
  Rutina,
  RutinaDraft,
  TipoSeccion,
} from '../types';

const RUTINA_SELECT = `
  id_rutina,
  id_cliente,
  nombre_rutina,
  fecha_inicio,
  fecha_fin,
  dias_rutina (
    id_dia_rutina,
    nombre_dia,
    orden_dia,
    notas,
    dia_rutina_grupo_muscular (
      grupos_musculares (
        id_grupo_muscular,
        nombre
      )
    ),
    ejercicios_rutina (
      id_detalle,
      tipo_seccion,
      series,
      repeticiones,
      duracion_segundos,
      porcentaje_intensidad,
      orden_ejercicio,
      ejercicios (
        id_ejercicio,
        nombre_ejercicio,
        descripcion
      )
    )
  )
`;

interface GrupoMuscularRow {
  id_grupo_muscular: number;
  nombre: string;
}

interface DiaGrupoRow {
  grupos_musculares: GrupoMuscularRow | GrupoMuscularRow[] | null;
}

interface EjercicioRow {
  id_ejercicio: number;
  nombre_ejercicio: string;
  descripcion: string | null;
}

interface EjercicioRutinaRow {
  id_detalle: number;
  tipo_seccion: TipoSeccion;
  series: number | null;
  repeticiones: number | null;
  duracion_segundos: number | null;
  porcentaje_intensidad: number | null;
  orden_ejercicio: number;
  ejercicios: EjercicioRow | EjercicioRow[] | null;
}

interface DiaRutinaRow {
  id_dia_rutina: number;
  nombre_dia: string;
  orden_dia: number;
  notas: string | null;
  dia_rutina_grupo_muscular: DiaGrupoRow[] | null;
  ejercicios_rutina: EjercicioRutinaRow[] | null;
}

interface RutinaRow {
  id_rutina: number;
  id_cliente: number;
  nombre_rutina: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  dias_rutina: DiaRutinaRow[] | null;
}

function asOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapEjercicio(row: EjercicioRow | null): Ejercicio | null {
  if (!row) return null;
  return {
    id_ejercicio: row.id_ejercicio,
    nombre_ejercicio: row.nombre_ejercicio,
    descripcion: row.descripcion,
  };
}

function mapDia(row: DiaRutinaRow): DiaRutina {
  const grupos: GrupoMuscular[] = (row.dia_rutina_grupo_muscular ?? [])
    .map((rel) => asOne(rel.grupos_musculares))
    .filter((grupo): grupo is GrupoMuscularRow => grupo !== null)
    .map((grupo) => ({
      id_grupo_muscular: grupo.id_grupo_muscular,
      nombre: grupo.nombre,
    }));

  const ejercicios: EjercicioRutina[] = (row.ejercicios_rutina ?? [])
    .map((ejercicio) => ({
      id_detalle: ejercicio.id_detalle,
      tipo_seccion: ejercicio.tipo_seccion,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      duracion_segundos: ejercicio.duracion_segundos,
      porcentaje_intensidad: ejercicio.porcentaje_intensidad,
      orden_ejercicio: ejercicio.orden_ejercicio ?? 1,
      ejercicios: mapEjercicio(asOne(ejercicio.ejercicios)),
    }))
    .sort((a, b) => a.orden_ejercicio - b.orden_ejercicio);

  return {
    id_dia_rutina: row.id_dia_rutina,
    nombre_dia: row.nombre_dia,
    orden_dia: row.orden_dia ?? 1,
    notas: row.notas,
    grupos_musculares: grupos,
    ejercicios_rutina: ejercicios,
  };
}

function mapRutina(row: RutinaRow): Rutina {
  const dias = (row.dias_rutina ?? [])
    .map(mapDia)
    .sort((a, b) => a.orden_dia - b.orden_dia);

  return {
    id_rutina: row.id_rutina,
    id_cliente: row.id_cliente,
    nombre_rutina: row.nombre_rutina,
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    dias_rutina: dias,
  };
}

export async function getRutinaCliente(idCliente: number): Promise<Rutina | null> {
  const { data, error } = await supabase
    .from('rutinas')
    .select(RUTINA_SELECT)
    .eq('id_cliente', idCliente)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRutina(data as unknown as RutinaRow);
}

export async function saveRutina(idRutina: number | null, draft: RutinaDraft): Promise<number> {
  const payload = {
    id_cliente: draft.id_cliente,
    nombre_rutina: draft.nombre_rutina,
    fecha_inicio: draft.fecha_inicio,
    fecha_fin: draft.fecha_fin,
  };

  let rutinaId = idRutina;

  if (rutinaId) {
    const { error } = await supabase.from('rutinas').update(payload).eq('id_rutina', rutinaId);
    if (error) throw error;

    const { error: deleteDaysError } = await supabase
      .from('dias_rutina')
      .delete()
      .eq('id_rutina', rutinaId);
    if (deleteDaysError) throw deleteDaysError;
  } else {
    const { error: deleteError } = await supabase
      .from('rutinas')
      .delete()
      .eq('id_cliente', draft.id_cliente);
    if (deleteError) throw deleteError;

    const { data, error } = await supabase
      .from('rutinas')
      .insert(payload)
      .select('id_rutina')
      .single();
    if (error) throw error;
    rutinaId = data.id_rutina as number;
  }

  for (const dia of draft.dias) {
    const { data: diaRow, error: diaError } = await supabase
      .from('dias_rutina')
      .insert({
        id_rutina: rutinaId,
        nombre_dia: dia.nombre_dia,
        orden_dia: dia.orden_dia,
        notas: dia.notas,
      })
      .select('id_dia_rutina')
      .single();

    if (diaError) throw diaError;
    const idDia = diaRow.id_dia_rutina as number;

    if (dia.id_grupos.length > 0) {
      const { error } = await supabase.from('dia_rutina_grupo_muscular').insert(
        dia.id_grupos.map((idGrupo) => ({
          id_dia_rutina: idDia,
          id_grupo_muscular: idGrupo,
        })),
      );
      if (error) throw error;
    }

    if (dia.ejercicios.length > 0) {
      const { error } = await supabase.from('ejercicios_rutina').insert(
        dia.ejercicios.map((ejercicio) => ({
          id_dia_rutina: idDia,
          id_ejercicio: ejercicio.id_ejercicio,
          tipo_seccion: ejercicio.tipo_seccion,
          series: ejercicio.series,
          repeticiones: ejercicio.repeticiones,
          duracion_segundos: ejercicio.duracion_segundos,
          porcentaje_intensidad: ejercicio.porcentaje_intensidad,
          orden_ejercicio: ejercicio.orden_ejercicio,
        })),
      );
      if (error) throw error;
    }
  }

  return rutinaId;
}

export async function deleteRutina(id: number): Promise<void> {
  const { error } = await supabase.from('rutinas').delete().eq('id_rutina', id);
  if (error) throw error;
}
