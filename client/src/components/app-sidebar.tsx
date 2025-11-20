import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Activity, Settings, Shield, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Group } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  {
    title: "Панель управления",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Управление администраторами",
    url: "/admins",
    icon: Shield,
    testId: "link-admins",
    mainAdminOnly: true,
  },
  {
    title: "Журнал изменений",
    url: "/activity",
    icon: Activity,
    testId: "link-activity",
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const getUserInitials = () => {
    if (!user) return "A";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "A";
  };

  const getUserDisplayName = () => {
    if (!user) return "Администратор";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || "Администратор";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm font-semibold" data-testid="text-app-title">Система паспортов</p>
            <p className="text-xs text-muted-foreground">Панель администратора</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.mainAdminOnly && !user?.isMainAdmin) {
                  return null;
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {groups.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Группы</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/?group=${group.id}`} data-testid={`link-group-${group.id}`}>
                        <Users className="w-4 h-4" />
                        <span>{group.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.isMainAdmin ? "Главный администратор" : "Администратор"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
