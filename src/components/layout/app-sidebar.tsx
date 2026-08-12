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
  LayoutGridIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SquareKanbanIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

import { BoardFormDialog } from "@/components/board/board-form-dialog"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import { PlanixLogo } from "@/components/planix-logo"
import { TeamSettingsDialog } from "@/components/team-settings/team-settings-dialog"
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
import { useActiveTeam } from "@/hooks/use-active-team"
import { useAuth } from "@/hooks/use-auth"
import { useBoards } from "@/hooks/use-boards"
import { useProfile } from "@/hooks/use-profile"
import { PATHS } from "@/routes/paths"

export function AppSidebar() {
  const { boardId } = useParams<{ boardId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()
  const { activeTeam } = useActiveTeam()

  const boards = useBoards(activeTeam?.id)
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

          <TeamSwitcher />
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
            {activeTeam && (
              <SidebarGroupAction
                aria-label="Novo quadro"
                onClick={() => setIsCreating(true)}
              >
                <PlusIcon />
              </SidebarGroupAction>
            )}

            <SidebarGroupContent>
              <SidebarMenu>
                {!activeTeam && !boards.isPending && (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    Crie uma equipe para começar.
                  </p>
                )}

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

                {activeTeam && boards.isSuccess && boards.data.length === 0 && (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhum quadro nesta equipe ainda.
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
        teamId={activeTeam?.id}
        onCreated={(board) => {
          closeOnMobile()
          navigate(PATHS.board(board.id))
        }}
      />

      <TeamSettingsDialog />
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
  const navigate = useNavigate()

  const profile = useProfile()

  function openProfile() {
    const params = new URLSearchParams(searchParams)
    params.set(PROFILE_PARAM, "1")

    setOpenMobile(false)
    setSearchParams(params)
  }

  function goToTeams() {
    setOpenMobile(false)
    close()
    navigate(PATHS.teams)
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
              <DropdownMenuItem onClick={openProfile} className="hover:cursor-pointer">
                <UserRoundIcon />
                Perfil
              </DropdownMenuItem>

              <DropdownMenuItem closeOnClick={false} onClick={toggleTheme}  className="hover:cursor-pointer">
                <SunIcon className="hidden dark:block" />
                <MoonIcon className="dark:hidden" />
                <span className="dark:hidden">Tema escuro</span>
                <span className="hidden dark:block">Tema claro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuItem onClick={goToTeams} className="hover:cursor-pointer">
                <LayoutGridIcon className="size-4 shrink-0" />
                Gerenciar equipes
              </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled={isLoggingOut} onClick={handleLogout}  className="hover:cursor-pointer" variant="destructive" >
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
