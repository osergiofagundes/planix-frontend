import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { CircleCheckIcon } from "lucide-react"

import { normalizeApiError } from "@/api/api-error"
import { CardActionsBar } from "@/components/card-detail/card-actions-bar"
import { CardAssigneesField } from "@/components/card-detail/card-assignees-field"
import { CardAttachments } from "@/components/card-detail/card-attachments"
import { CardChecklist } from "@/components/card-detail/card-checklist"
import { CardComments } from "@/components/card-detail/card-comments"
import { CardDescriptionField } from "@/components/card-detail/card-description-field"
import { CardDueDateField } from "@/components/card-detail/card-due-date-field"
import { CardHistory } from "@/components/card-detail/card-history"
import { CardLabelsField } from "@/components/card-detail/card-labels-field"
import { CardLinks } from "@/components/card-detail/card-links"
import { CardPriorityField } from "@/components/card-detail/card-priority-field"
import { CardTitleField } from "@/components/card-detail/card-title-field"
import { ErrorState } from "@/components/error-state"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCard } from "@/hooks/use-card"
import { useLists } from "@/hooks/use-lists"
import { formatDateTime } from "@/lib/date"
import { PATHS } from "@/routes/paths"

export function CardDetailDialog() {
  const { boardId, cardId } = useParams<{ boardId: string; cardId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState("geral")

  const card = useCard(cardId)
  const lists = useLists(boardId)

  const list = lists.data?.find((item) => item.id === card.data?.listId)

  function close() {
    if (location.key === "default") {
      navigate(PATHS.board(boardId!), { replace: true })
      return
    }

    navigate(-1)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex h-[90svh] w-full flex-col gap-0 p-0 sm:max-w-3xl max-sm:h-svh max-sm:max-w-full">
        {card.isError ? (
          <div className="p-6">
            <DialogTitle className="sr-only">Cartão indisponível</DialogTitle>
            <ErrorState
              error={normalizeApiError(card.error)}
              showBackToBoards={false}
            />
          </div>
        ) : card.isPending ? (
          <div className="flex flex-col gap-4 p-6">
            <DialogTitle className="sr-only">Carregando o cartão</DialogTitle>
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <header className="border-b p-4 pr-12 sm:p-6 sm:pr-14">
              <div className="flex min-w-0 flex-col gap-1">
                {card.data.completed && (
                  <Badge variant="secondary" className="w-fit">
                    <CircleCheckIcon />
                    Concluído
                  </Badge>
                )}

                <DialogTitle className="sr-only">{card.data.title}</DialogTitle>
                <CardTitleField card={card.data} />

                <DialogDescription>
                  na lista{" "}
                  <span className="font-medium text-foreground">
                    {list?.name ?? "—"}
                  </span>
                  {card.data.completedAt &&
                    ` · concluído em ${formatDateTime(card.data.completedAt)}`}
                </DialogDescription>
              </div>
              <div className="pt-4">
                <CardActionsBar
                  card={card.data}
                  boardId={boardId!}
                  onDeleted={close}
                />
              </div>
              
            </header>

            <Tabs
              value={tab}
              onValueChange={(value) => setTab(String(value))}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="mx-4 mt-4 w-fit max-w-full sm:mx-6">
                <TabsTrigger value="geral">Detalhes</TabsTrigger>
                <TabsTrigger value="anexos">Links e Anexos</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent
                value="geral"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
                  <aside className="flex flex-col gap-4 lg:order-2">
                    <CardAssigneesField card={card.data} boardId={boardId!} />
                    <CardPriorityField card={card.data} />
                    <CardDueDateField card={card.data} />
                  </aside>

                  <div className="flex flex-col gap-6 lg:order-1">
                    <CardLabelsField card={card.data} boardId={boardId!} />
                    <CardDescriptionField card={card.data} />
                    <Separator />
                    <CardChecklist cardId={cardId!} />
                    <Separator />
                    <CardComments cardId={cardId!} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="anexos"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
              >
                <div className="flex flex-col gap-6">
                  <CardLinks cardId={cardId!} />
                  <Separator />
                  <CardAttachments cardId={cardId!} />
                </div>
              </TabsContent>

              <TabsContent
                value="historico"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
              >
                <CardHistory cardId={cardId!} enabled={tab === "historico"} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
