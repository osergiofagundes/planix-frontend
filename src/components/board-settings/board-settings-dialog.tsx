import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { BoardDangerTab } from "@/components/board-settings/board-danger-tab"
import { BoardGeneralTab } from "@/components/board-settings/board-general-tab"
import { BoardInvitesTab } from "@/components/board-settings/board-invites-tab"
import { BoardLabelsTab } from "@/components/board-settings/board-labels-tab"
import { BoardMembersTab } from "@/components/board-settings/board-members-tab"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import type { BoardResponse } from "@/types/board.types"

const SETTINGS_PARAM = "settings"

const SETTINGS_TABS = ["geral", "membros", "convites", "etiquetas", "perigo"]

const OWNER_ONLY_TABS = ["geral", "convites", "perigo"]

interface BoardSettingsDialogProps {
  board: BoardResponse
}

export function BoardSettingsDialog({ board }: BoardSettingsDialogProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const requestedTab = searchParams.get(SETTINGS_PARAM)

  if (requestedTab === null) {
    return null
  }

  const boardId = String(board.id)
  const isOwner = user?.id === board.owner.id

  const tab = SETTINGS_TABS.includes(requestedTab) ? requestedTab : "geral"

  const activeTab = !isOwner && OWNER_ONLY_TABS.includes(tab) ? "membros" : tab

  function changeTab(next: string) {
    const params = new URLSearchParams(searchParams)
    params.set(SETTINGS_PARAM, next)

    setSearchParams(params, { replace: true })
  }

  function close() {
    if (location.key === "default") {
      const params = new URLSearchParams(searchParams)
      params.delete(SETTINGS_PARAM)
      setSearchParams(params, { replace: true })
      return
    }

    navigate(-1)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex h-[90svh] w-full flex-col gap-0 p-0 sm:max-w-3xl max-sm:h-svh max-sm:max-w-full">
        <header className="flex flex-col gap-1 border-b p-4 pr-12 sm:p-6 sm:pr-14">
          <DialogTitle>Configurações do quadro</DialogTitle>
          <DialogDescription className="truncate">
            {board.name}
          </DialogDescription>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) => changeTab(String(value))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="mx-4 mt-4 w-fit max-w-full sm:mx-6">
            {isOwner && <TabsTrigger value="geral">Geral</TabsTrigger>}
            <TabsTrigger value="membros">Membros</TabsTrigger>
            {isOwner && <TabsTrigger value="convites">Convites</TabsTrigger>}
            <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
            {isOwner && <TabsTrigger value="perigo">Zona de perigo</TabsTrigger>}
          </TabsList>

          {isOwner && (
            <TabsContent
              value="geral"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            >
              <BoardGeneralTab board={board} />
            </TabsContent>
          )}

          <TabsContent
            value="membros"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
          >
            <BoardMembersTab board={board} isOwner={isOwner} />
          </TabsContent>

          {isOwner && (
            <TabsContent
              value="convites"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            >
              <BoardInvitesTab
                boardId={boardId}
                enabled={activeTab === "convites"}
              />
            </TabsContent>
          )}

          <TabsContent
            value="etiquetas"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
          >
            <BoardLabelsTab boardId={boardId} />
          </TabsContent>

          {isOwner && (
            <TabsContent
              value="perigo"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            >
              <BoardDangerTab board={board} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
