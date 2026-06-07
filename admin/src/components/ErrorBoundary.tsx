import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props  = { children: ReactNode };
type State  = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[KrackIT Admin] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-8">
          <div className="max-w-md w-full rounded-3xl border border-[var(--destructive)]/30 bg-[var(--surface)] p-8 text-center space-y-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--destructive)]/15 mx-auto">
              <AlertTriangle className="h-8 w-8 text-[var(--destructive)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Something went wrong</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                An unexpected error occurred in the admin panel.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--background)] px-4 py-3 text-left">
              <p className="text-xs font-mono text-[var(--destructive)] break-all leading-relaxed">
                {this.state.error.message}
              </p>
            </div>
            <button
              onClick={() => this.setState({ error: null })}
              className="flex items-center gap-2 mx-auto rounded-xl gold-gradient px-6 py-2.5 text-sm font-bold text-[#1a1410]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
