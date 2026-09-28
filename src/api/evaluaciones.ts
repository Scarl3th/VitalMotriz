import { supabase } from '../lib/supabase';
import type { EvaluacionFisica, EvaluacionInput } from '../types';

const EVALUACION_SELECT =
  'id_evaluacion, id_cliente, fecha_evaluacion, peso_kg, altura_cm, brazo_contraido_cm, brazo_relajado_cm, cintura_cm, muslo_medio_cm, pantorrilla_cm, objetivo';

export async function listEvaluaciones(idCliente: number): Promise<EvaluacionFisica[]> {
  const { data, error } = await supabase
    .from('evaluaciones_fisicas')
    .select(EVALUACION_SELECT)
    .eq('id_cliente', idCliente)
    .order('fecha_evaluacion', { ascending: false });

  if (error) throw error;
  return (data ?? []) as EvaluacionFisica[];
}

export async function getEvaluacion(id: number): Promise<EvaluacionFisica | null> {
  const { data, error } = await supabase
    .from('evaluaciones_fisicas')
    .select(EVALUACION_SELECT)
    .eq('id_evaluacion', id)
    .maybeSingle();

  if (error) throw error;
  return (data as EvaluacionFisica | null) ?? null;
}

export async function createEvaluacion(input: EvaluacionInput): Promise<EvaluacionFisica> {
  const { data, error } = await supabase
    .from('evaluaciones_fisicas')
    .insert(input)
    .select(EVALUACION_SELECT)
    .single();

  if (error) throw error;
  return data as EvaluacionFisica;
}

export async function updateEvaluacion(
  id: number,
  input: EvaluacionInput,
): Promise<EvaluacionFisica> {
  const { data, error } = await supabase
    .from('evaluaciones_fisicas')
    .update(input)
    .eq('id_evaluacion', id)
    .select(EVALUACION_SELECT)
    .single();

  if (error) throw error;
  return data as EvaluacionFisica;
}

export async function deleteEvaluacion(id: number): Promise<void> {
  const { error } = await supabase.from('evaluaciones_fisicas').delete().eq('id_evaluacion', id);
  if (error) throw error;
}
