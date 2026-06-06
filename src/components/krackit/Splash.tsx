import logo from "@/assets/krackit-logo.png";

export function Splash() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 bg-background animate-in fade-in duration-500">
      <img src={logo} alt="KrackIT" width={120} height={120} className="drop-shadow-[0_10px_40px_rgba(212,162,76,0.35)]" />
      <div className="text-center">
        <h1 className="gold-text text-4xl font-bold tracking-tight">KrackIT</h1>
        <p className="mt-1 text-sm text-muted-foreground">One trick ahead</p>
      </div>
      <div className="mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-1/2 gold-gradient animate-[loading_1.4s_ease-in-out_infinite]" />
      </div>
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(220%)}}`}</style>
    </div>
  );
}
