import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAvatarImage } from "@/hooks/use-profile"
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
  const image = useAvatarImage(user.avatarUrl)

  const avatar = (
    <Avatar size={size} className={cn(className)}>
      {image.data && <AvatarImage src={image.data} alt="" />}
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
