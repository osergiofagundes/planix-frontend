import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getInitials } from "@/lib/initials"
import { cn } from "@/lib/utils"
import type { UserSummary } from "@/types/user.types"

interface UserAvatarProps {
  user: UserSummary
  size?: "sm" | "default" | "lg"
  showTooltip?: boolean
  className?: string
}

export function UserAvatar({
  user,
  size = "default",
  showTooltip = true,
  className,
}: UserAvatarProps) {
  const avatar = (
    <Avatar size={size} className={cn(className)}>
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  )

  if (!showTooltip) {
    return avatar
  }

  return (
    <Tooltip>
      <TooltipTrigger render={avatar} />
      <TooltipContent>{user.name}</TooltipContent>
    </Tooltip>
  )
}
