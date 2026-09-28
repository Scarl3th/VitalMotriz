interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-[10px] border border-line bg-surface px-6 py-12 text-center text-muted">
      <strong className="mb-2 block font-bold text-heading">{title}</strong>
      <p>{message}</p>
    </div>
  );
}
