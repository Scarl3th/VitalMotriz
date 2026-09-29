export const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-heading outline-none placeholder:text-muted focus:border-neon focus:shadow-[0_0_0_3px_var(--color-neon-dim)]';

export const labelClass =
  'mb-1.5 block font-display text-[13px] font-bold uppercase tracking-wider text-neon';

const btnBase =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm no-underline';

const primaryTone = 'border-neon-border bg-neon-dim font-bold text-neon hover:bg-neon hover:text-page';
const secondaryTone = 'border-line bg-transparent font-semibold text-heading hover:bg-neon-dim';
const dangerToneBase = 'border-danger-border font-bold text-danger hover:bg-danger hover:text-heading';
const dangerTone = `${dangerToneBase} bg-danger-dim`;

export const btnPrimary = `${btnBase} ${primaryTone} px-4 py-2`;
export const btnSecondary = `${btnBase} ${secondaryTone} px-4 py-2`;
export const btnDanger = `${btnBase} ${dangerTone} px-4 py-2`;
export const btnDangerSolid = `${btnBase} ${dangerToneBase} bg-danger-solid px-4 py-2`;

export const iconBtnSecondary = `${btnBase} ${secondaryTone} size-9 shrink-0`;
export const iconBtnDanger = `${btnBase} ${dangerTone} size-9 shrink-0`;

export const iconClass = 'size-4 shrink-0';
