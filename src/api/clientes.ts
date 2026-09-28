import { supabase } from '../lib/supabase';
import { sanitizeSearch } from '../lib/format';
import type { Cliente, ClienteInput } from '../types';

const CLIENTE_SELECT =
  'id_cliente, nombre, apellido, email, telefono, fecha_nacimiento, fecha_registro';

export async function listClientes(query = ''): Promise<Cliente[]> {
  const search = sanitizeSearch(query);

  let request = supabase
    .from('clientes')
    .select(CLIENTE_SELECT)
    .order('apellido', { ascending: true, nullsFirst: false })
    .order('nombre', { ascending: true });

  if (search) {
    request = request.or(
      `nombre.ilike.%${search}%,apellido.ilike.%${search}%,telefono.ilike.%${search}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as Cliente[];
}

export async function getCliente(id: number): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from('clientes')
    .select(CLIENTE_SELECT)
    .eq('id_cliente', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Cliente | null) ?? null;
}

export async function createCliente(input: ClienteInput): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert(input)
    .select(CLIENTE_SELECT)
    .single();

  if (error) throw error;
  return data as Cliente;
}

export async function updateCliente(id: number, input: ClienteInput): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .update(input)
    .eq('id_cliente', id)
    .select(CLIENTE_SELECT)
    .single();

  if (error) throw error;
  return data as Cliente;
}

export async function deleteCliente(id: number): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id_cliente', id);
  if (error) throw error;
}
