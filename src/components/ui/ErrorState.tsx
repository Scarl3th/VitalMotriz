interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-[10px] border border-danger-border bg-danger-dim px-6 py-12 text-center text-danger">
      <strong className="mb-2 block font-bold text-danger">No se pudo cargar</strong>
      <p>{message}</p>
    </div>
  );
}
