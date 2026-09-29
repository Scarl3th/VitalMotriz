import { useId, type ChangeEvent } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { DayPicker, type ChevronProps, type DropdownProps, type Matcher } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { parseDateOnly, toDateOnly } from '../../lib/format';
import { inputClass, labelClass } from './formStyles';
import Select from './Select';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  fromYear?: number;
  toYear?: number;
  clearable?: boolean;
  className?: string;
}

const chevrons = { left: ChevronLeft, right: ChevronRight, up: ChevronUp, down: ChevronDown };

function CalendarChevron({ orientation = 'left', className }: ChevronProps) {
  const Icon = chevrons[orientation];
  return <Icon className={cn('size-4', className)} />;
}

function CalendarDropdown({ options = [], value, onChange, className, disabled, ...props }: DropdownProps) {
  return (
    <Select
      size="sm"
      className={className}
      value={Number(value)}
      disabled={disabled}
      aria-label={props['aria-label']}
      options={options.map((option) => ({ value: option.value, label: option.label }))}
      onChange={(next) => onChange?.({ target: { value: String(next) } } as ChangeEvent<HTMLSelectElement>)}
    />
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const navButtonClass =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-heading aria-disabled:pointer-events-none aria-disabled:opacity-30';

const footerButtonClass =
  'cursor-pointer rounded-md px-2.5 py-1 text-sm font-semibold hover:bg-surface-hover';

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar fecha',
  min,
  max,
  fromYear,
  toYear,
  clearable = true,
  className,
}: DatePickerProps) {
  const labelId = useId();
  const valueId = useId();

  const selected = parseDateOnly(value) ?? undefined;
  const minDate = parseDateOnly(min);
  const maxDate = parseDateOnly(max);
  const hoy = new Date();
  const anioActual = hoy.getFullYear();

  const hoyIso = toDateOnly(hoy);
  const hoyFueraDeRango = Boolean((min && hoyIso < min) || (max && hoyIso > max));

  const disabled: Matcher[] = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  const texto = selected
    ? selected.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : placeholder;

  return (
    <Popover className={className}>
      {label && (
        <span id={labelId} className={labelClass}>
          {label}
        </span>
      )}
      <PopoverButton
        aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
        className={cn(
          inputClass,
          'flex cursor-pointer items-center justify-between gap-2 text-left data-open:border-neon data-open:shadow-[0_0_0_3px_var(--color-neon-dim)]',
        )}
      >
        <span id={valueId} className={cn('truncate', !selected && 'text-muted')}>
          {texto}
        </span>
        <CalendarDays className="size-4 shrink-0 text-muted" />
      </PopoverButton>

      <PopoverPanel
        anchor="bottom start"
        transition
        className="z-50 rounded-xl border border-line bg-surface p-3 shadow-lg shadow-black/40 outline-none [--anchor-gap:6px] transition duration-100 ease-out data-closed:-translate-y-1 data-closed:opacity-0"
      >
        {({ close }) => (
          <>
            <DayPicker
              mode="single"
              required
              autoFocus
              locale={es}
              selected={selected}
              defaultMonth={selected ?? maxDate ?? hoy}
              onSelect={(date) => {
                onChange(toDateOnly(date));
                close();
              }}
              disabled={disabled}
              captionLayout="dropdown"
              navLayout="around"
              startMonth={new Date(fromYear ?? anioActual - 10, 0)}
              endMonth={new Date(toYear ?? anioActual + 10, 11)}
              formatters={{
                formatMonthDropdown: (month) =>
                  capitalize(month.toLocaleDateString('es-CL', { month: 'long' })),
              }}
              components={{ Chevron: CalendarChevron, Dropdown: CalendarDropdown }}
              classNames={{
                root: 'w-76',
                months: 'relative',
                month: 'grid grid-cols-[auto_1fr_auto] items-center gap-x-1 gap-y-3',
                month_caption: 'flex justify-center',
                dropdowns: 'flex gap-2',
                months_dropdown: 'w-32',
                years_dropdown: 'w-24',
                button_previous: navButtonClass,
                button_next: navButtonClass,
                month_grid: 'col-span-3 w-full border-collapse',
                weekdays: '',
                weekday: 'h-8 text-xs font-semibold text-muted capitalize',
                week: '',
                day: 'p-0.5 text-center text-sm',
                day_button:
                  'mx-auto flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-neon',
                today: '[&>button]:font-bold [&>button]:text-neon',
                selected: '[&>button]:bg-neon! [&>button]:font-bold [&>button]:text-page!',
                outside: '[&>button]:text-muted/50',
                disabled: '[&>button]:pointer-events-none [&>button]:opacity-30',
                hidden: 'invisible',
              }}
            />
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
              {clearable ? (
                <button
                  type="button"
                  className={cn(footerButtonClass, 'text-muted hover:text-heading')}
                  onClick={() => {
                    onChange('');
                    close();
                  }}
                >
                  Borrar
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className={cn(footerButtonClass, 'text-neon disabled:pointer-events-none disabled:opacity-30')}
                disabled={hoyFueraDeRango}
                onClick={() => {
                  onChange(hoyIso);
                  close();
                }}
              >
                Hoy
              </button>
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
