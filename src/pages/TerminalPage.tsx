import { Terminal } from "../components/Terminal";
import { PageMeta } from "../components/PageMeta";

export function TerminalPage() {
  return (
    <>
      <PageMeta
        title="Developer CLI Terminal"
        description="Interactive developer command line interface for navigating projects, technical skills, background, and experience."
      />
      <main className="min-h-[85vh] px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="container-x">
          <div className="mx-auto mb-8 max-w-4xl text-center">
            <span className="eyebrow justify-center">Interactive Shell</span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Developer <span className="text-gradient">Terminal</span>
            </h1>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Navigate the portfolio like an engineer. Type <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-accent">help</code> to see available commands.
            </p>
          </div>

          <Terminal />
        </div>
      </main>
    </>
  );
}
