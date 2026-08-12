import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash2Icon } from "lucide-react"

import { DeleteTeamDialog } from "@/components/team/delete-team-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PATHS } from "@/routes/paths"
import type { TeamResponse } from "@/types/team.types"

export function TeamDangerTab({ team }: { team: TeamResponse }) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Excluir esta equipe</CardTitle>
        <CardDescription>
          Apaga permanentemente todos os quadros desta equipe, com listas,
          cartões, comentários e anexos. Todo mundo perde o acesso na hora. Esta
          ação não pode ser desfeita.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button variant="destructive" onClick={() => setIsDeleting(true)}>
          <Trash2Icon data-icon="inline-start" />
          Excluir equipe
        </Button>
      </CardContent>

      {isDeleting && (
        <DeleteTeamDialog
          open
          onOpenChange={(open) => !open && setIsDeleting(false)}
          team={team}
          onDeleted={() => navigate(PATHS.boards, { replace: true })}
        />
      )}
    </Card>
  )
}
