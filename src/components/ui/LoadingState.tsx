interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="rounded-[10px] border border-line bg-surface px-6 py-12 text-center text-muted">
      <p>{message}</p>
    </div>
  );
}
