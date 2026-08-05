import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash2Icon } from "lucide-react"

import { DeleteBoardDialog } from "@/components/board/delete-board-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PATHS } from "@/routes/paths"
import type { BoardResponse } from "@/types/board.types"

export function BoardDangerTab({ board }: { board: BoardResponse }) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Excluir este quadro</CardTitle>
        <CardDescription>
          Apaga permanentemente todas as listas, cartões, comentários e anexos
          deste quadro. Os membros perdem o acesso na hora. Esta ação não pode
          ser desfeita.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button variant="destructive" onClick={() => setIsDeleting(true)}>
          <Trash2Icon data-icon="inline-start" />
          Excluir quadro
        </Button>
      </CardContent>

      {isDeleting && (
        <DeleteBoardDialog
          open
          onOpenChange={(open) => !open && setIsDeleting(false)}
          board={board}
          onDeleted={() => navigate(PATHS.boards, { replace: true })}
        />
      )}
    </Card>
  )
}
