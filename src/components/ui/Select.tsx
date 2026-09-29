import { useMemo, useRef, useState } from 'react';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { normalizeText } from '../../lib/format';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'md' | 'sm';
  'aria-label'?: string;
}

const fieldClass =
  'w-full rounded-lg border border-line bg-surface text-heading outline-none placeholder:text-muted data-disabled:cursor-not-allowed data-disabled:opacity-50';

const sizeClass = { md: 'py-2.5', sm: 'py-1.5 text-sm' };

const focusClass =
  'data-focus:border-neon data-focus:shadow-[0_0_0_3px_var(--color-neon-dim)] data-open:border-neon';

const panelClass =
  'z-50 max-h-60 overflow-auto rounded-lg border border-line bg-surface p-1 shadow-lg shadow-black/40 outline-none [--anchor-gap:4px] transition duration-100 ease-out data-closed:-translate-y-1 data-closed:opacity-0';

const optionClass =
  'group flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink select-none data-focus:bg-surface-hover data-selected:font-semibold data-selected:text-neon';

const chevronClass = 'size-4 shrink-0 text-muted transition-transform group-data-open:rotate-180';

function OptionContent({ label }: { label: string }) {
  return (
    <>
      <Check className="invisible size-4 shrink-0 text-neon group-data-selected:visible" />
      <span className="truncate">{label}</span>
    </>
  );
}

export default function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  searchable = false,
  disabled = false,
  className,
  size = 'md',
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [query, setQuery] = useState('');
  const enfocadoAntesDelClick = useRef(false);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const termino = normalizeText(query);
    if (!termino) return options;
    return options.filter((option) => normalizeText(option.label).includes(termino));
  }, [options, query]);

  if (searchable) {
    return (
      <div className={cn('relative', className)}>
        <Combobox
          value={value}
          onChange={(next: T | null) => {
            if (next !== null) onChange(next);
          }}
          onClose={() => setQuery('')}
          disabled={disabled}
          immediate
        >
          <ComboboxInput
            className={cn(fieldClass, sizeClass[size], focusClass, 'pl-3.5 pr-10')}
            displayValue={(current: T) =>
              options.find((option) => option.value === current)?.label ?? ''
            }
            onChange={(event) => setQuery(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onMouseDown={(event) => {
              enfocadoAntesDelClick.current = document.activeElement === event.currentTarget;
            }}
            onClick={(event) => {
              if (!enfocadoAntesDelClick.current) event.currentTarget.select();
            }}
            placeholder={placeholder}
            aria-label={ariaLabel}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 flex cursor-pointer items-center px-3">
            <ChevronDown className={chevronClass} />
          </ComboboxButton>
          <ComboboxOptions anchor="bottom start" transition className={cn(panelClass, 'w-(--input-width)')}>
            {filtered.length === 0 ? (
              <div className="px-2.5 py-2 text-sm text-muted">Sin resultados</div>
            ) : (
              filtered.map((option) => (
                <ComboboxOption key={option.value} value={option.value} className={optionClass}>
                  <OptionContent label={option.label} />
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <ListboxButton
          className={cn(
            fieldClass,
            sizeClass[size],
            focusClass,
            'group flex cursor-pointer items-center justify-between gap-2 px-3.5 text-left',
          )}
          aria-label={ariaLabel}
        >
          <span className={cn('truncate', !selected && 'text-muted')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown className={chevronClass} />
        </ListboxButton>
        <ListboxOptions anchor="bottom start" transition className={cn(panelClass, 'min-w-(--button-width)')}>
          {options.map((option) => (
            <ListboxOption key={option.value} value={option.value} className={optionClass}>
              <OptionContent label={option.label} />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
