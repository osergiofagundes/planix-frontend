import { Spinner } from "@/components/ui/spinner"

/** Estado de carregamento que ocupa a tela — usado enquanto a sessão é verificada. */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" aria-label="Carregando" />
    </div>
  )
}
