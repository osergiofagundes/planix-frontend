import { Link } from "react-router-dom"
import { CircleAlertIcon, SearchXIcon, ServerCrashIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PATHS } from "@/routes/paths"
import type { NormalizedApiError } from "@/types/api.types"

interface ErrorStateProps {
  error: NormalizedApiError
  onRetry?: () => void
  showBackToBoards?: boolean
}

export function ErrorState({
  error,
  onRetry,
  showBackToBoards = true,
}: ErrorStateProps) {
  const isNotFound = error.status === 404 || error.status === 403

  return (
    <Empty className="min-h-[60svh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isNotFound ? (
            <SearchXIcon />
          ) : error.isNetworkError ? (
            <CircleAlertIcon />
          ) : (
            <ServerCrashIcon />
          )}
        </EmptyMedia>

        <EmptyTitle>
          {isNotFound
            ? "Este quadro não está disponível"
            : error.isNetworkError
              ? "Sem conexão com o servidor"
              : "Alguma coisa quebrou do nosso lado"}
        </EmptyTitle>

        <EmptyDescription>
          {isNotFound
            ? "Ele pode ter sido excluído, ou você pode não ter acesso."
            : error.message}
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onRetry && !isNotFound && (
            <Button onClick={onRetry}>Tentar novamente</Button>
          )}

          {showBackToBoards && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to={PATHS.boards} />}
            >
              Voltar para meus quadros
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  )
}
