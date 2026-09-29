export type TipoSeccion = 'calentamiento' | 'principal';

export interface GrupoMuscular {
  id_grupo_muscular: number;
  nombre: string;
}

export interface Ejercicio {
  id_ejercicio: number;
  nombre_ejercicio: string;
  descripcion: string | null;
}

export interface EjercicioRutina {
  id_detalle: number;
  tipo_seccion: TipoSeccion;
  series: number | null;
  repeticiones: number | null;
  duracion_segundos: number | null;
  porcentaje_intensidad: number | null;
  orden_ejercicio: number;
  ejercicios: Ejercicio | null;
}

export interface DiaRutina {
  id_dia_rutina: number;
  nombre_dia: string;
  orden_dia: number;
  notas: string | null;
  grupos_musculares: GrupoMuscular[];
  ejercicios_rutina: EjercicioRutina[];
}

export interface Rutina {
  id_rutina: number;
  id_cliente: number;
  nombre_rutina: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  dias_rutina: DiaRutina[];
}

export interface EjercicioCatalogo extends Ejercicio {
  grupos_musculares: GrupoMuscular[];
}

export interface RutinaDraftEjercicio {
  id_ejercicio: number;
  tipo_seccion: TipoSeccion;
  series: number | null;
  repeticiones: number | null;
  duracion_segundos: number | null;
  porcentaje_intensidad: number | null;
  orden_ejercicio: number;
}

export interface RutinaDraftDia {
  nombre_dia: string;
  orden_dia: number;
  notas: string | null;
  id_grupos: number[];
  ejercicios: RutinaDraftEjercicio[];
}

export interface RutinaDraft {
  id_cliente: number;
  nombre_rutina: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  dias: RutinaDraftDia[];
}
