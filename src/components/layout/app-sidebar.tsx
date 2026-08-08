import { useState } from "react"
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SquareKanbanIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { BoardFormDialog } from "@/components/board/board-form-dialog"
import { PlanixLogo } from "@/components/planix-logo"
import {
  PROFILE_PARAM,
  ProfileDialog,
} from "@/components/profile/profile-dialog"
import { useTheme } from "@/components/theme-provider"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useBoards } from "@/hooks/use-boards"
import { useProfile } from "@/hooks/use-profile"
import { PATHS } from "@/routes/paths"

export function AppSidebar() {
  const { boardId } = useParams<{ boardId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()

  const boards = useBoards()
  const [isCreating, setIsCreating] = useState(false)

  const isBoardsSection = location.pathname.startsWith(PATHS.boards)

  function closeOnMobile() {
    setOpenMobile(false)
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            to={PATHS.boards}
            onClick={closeOnMobile}
            className="flex items-center p-1 group-data-[collapsible=icon]:justify-center"
            aria-label="Planix — meus quadros"
          >
            <PlanixLogo wordmarkClassName="group-data-[collapsible=icon]:hidden" />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isBoardsSection}
                    tooltip="Quadros"
                    render={<Link to={PATHS.boards} onClick={closeOnMobile} />}
                  >
                    <SquareKanbanIcon />
                    <span>Quadros</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Quadros</SidebarGroupLabel>
            <SidebarGroupAction
              aria-label="Novo quadro"
              onClick={() => setIsCreating(true)}
            >
              <PlusIcon />
            </SidebarGroupAction>

            <SidebarGroupContent>
              <SidebarMenu>
                {boards.isPending &&
                  Array.from({ length: 4 }, (_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))}

                {boards.isError && (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    Não foi possível carregar seus quadros.
                  </p>
                )}

                {boards.isSuccess && boards.data.length === 0 && (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhum quadro ainda.
                  </p>
                )}

                {boards.data?.map((board) => (
                  <SidebarMenuItem key={board.id}>
                    <SidebarMenuButton
                      isActive={String(board.id) === boardId}
                      render={
                        <Link
                          to={PATHS.board(board.id)}
                          onClick={closeOnMobile}
                        />
                      }
                    >
                      <DynamicIcon
                        name={(board.icon ?? "square-kanban") as IconName}
                        aria-hidden
                        className="size-4 shrink-0"
                      />
                      <span>{board.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <BoardFormDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onCreated={(board) => {
          closeOnMobile()
          navigate(PATHS.board(board.id))
        }}
      />

      <ProfileDialog />
    </>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const { setTheme } = useTheme()
  const { isMobile, setOpenMobile } = useSidebar()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const profile = useProfile()

  function openProfile() {
    const params = new URLSearchParams(searchParams)
    params.set(PROFILE_PARAM, "1")

    setOpenMobile(false)
    setSearchParams(params)
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "light" : "dark")
  }

  if (!user) {
    return null
  }

  const displayUser = profile.data ?? user

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <UserAvatar user={displayUser} size="sm" showTooltip={false} />
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-medium">{displayUser.name}</span>
              <span className="truncate text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate font-medium">{displayUser.name}</span>
                <span className="truncate font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={openProfile}>
                <UserRoundIcon />
                Perfil
              </DropdownMenuItem>

              <DropdownMenuItem closeOnClick={false} onClick={toggleTheme}>
                <SunIcon className="hidden dark:block" />
                <MoonIcon className="dark:hidden" />
                <span className="dark:hidden">Tema escuro</span>
                <span className="hidden dark:block">Tema claro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled={isLoggingOut} onClick={handleLogout}>
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
