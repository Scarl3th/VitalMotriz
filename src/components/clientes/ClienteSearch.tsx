interface ClienteSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ClienteSearch({ value, onChange }: ClienteSearchProps) {
  return (
    <input
      className="w-full min-w-0 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-heading outline-none placeholder:text-muted focus:border-neon focus:shadow-[0_0_0_3px_var(--color-neon-dim)] sm:flex-1 md:max-w-[560px]"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar por nombre, apellido o teléfono"
      aria-label="Buscar cliente"
    />
  );
}
