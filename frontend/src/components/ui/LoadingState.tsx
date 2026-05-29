export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-cyber-cyan animate-spin mb-4 shadow-[0_0_15px_rgba(82,225,254,0.3)]"></div>
      <p className="text-cloudburst text-sm font-[family-name:var(--font-mono)]">{message}</p>
    </div>
  );
}
