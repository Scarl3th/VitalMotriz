export interface EvaluacionFisica {
  id_evaluacion: number;
  id_cliente: number;
  fecha_evaluacion: string;
  peso_kg: number | null;
  altura_cm: number | null;
  brazo_contraido_cm: number | null;
  brazo_relajado_cm: number | null;
  cintura_cm: number | null;
  muslo_medio_cm: number | null;
  pantorrilla_cm: number | null;
  objetivo: string | null;
}

export interface EvaluacionInput {
  id_cliente: number;
  fecha_evaluacion: string;
  peso_kg: number | null;
  altura_cm: number | null;
  brazo_contraido_cm: number | null;
  brazo_relajado_cm: number | null;
  cintura_cm: number | null;
  muslo_medio_cm: number | null;
  pantorrilla_cm: number | null;
  objetivo: string | null;
}
