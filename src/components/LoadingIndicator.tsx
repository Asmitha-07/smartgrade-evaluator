const LoadingIndicator = () => (
  <div className="flex flex-col items-center gap-4 py-16">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-foreground animate-pulse-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
    <p className="text-sm text-muted-foreground">Evaluating answers…</p>
  </div>
);

export default LoadingIndicator;
