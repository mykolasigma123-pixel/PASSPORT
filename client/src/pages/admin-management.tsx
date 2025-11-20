import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, UserX, UserCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminManagement() {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Выполняется вход в систему...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !currentUser?.isMainAdmin) {
      toast({
        title: "Доступ запрещен",
        description: "Только главный администратор может управлять пользователями",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [currentUser, isAuthenticated, authLoading, toast]);

  const { data: admins = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admins"],
    enabled: isAuthenticated && currentUser?.isMainAdmin,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/admins/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({
        title: selectedAdmin?.isActive ? "Администратор деактивирован" : "Администратор активирован",
      });
      setIsToggleDialogOpen(false);
      setSelectedAdmin(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Требуется авторизация",
          description: "Выполняется вход в систему...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус администратора",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || !currentUser?.isMainAdmin) {
    return null;
  }

  const getUserInitials = (user: User) => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "A";
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || "Администратор";
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-admins-title">
          Управление администраторами
        </h1>
        <p className="text-muted-foreground">
          Создание и управление учетными записями администраторов
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего администраторов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-total-admins">
              {admins.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400" data-testid="text-active-admins">
              {admins.filter((a) => a.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Деактивированных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-muted-foreground" data-testid="text-inactive-admins">
              {admins.filter((a) => !a.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Администраторы системы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 rounded-md hover-elevate"
                data-testid={`admin-row-${admin.id}`}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={admin.profileImageUrl || undefined} />
                    <AvatarFallback>{getUserInitials(admin)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium" data-testid={`admin-name-${admin.id}`}>
                      {getUserDisplayName(admin)}
                    </p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {admin.isMainAdmin && (
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                      <Shield className="w-3 h-3 mr-1" />
                      Главный
                    </Badge>
                  )}
                  {admin.isActive ? (
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                      Активен
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
                      Деактивирован
                    </Badge>
                  )}
                  {!admin.isMainAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsToggleDialogOpen(true);
                      }}
                      data-testid={`button-toggle-${admin.id}`}
                    >
                      {admin.isActive ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Деактивировать
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Активировать
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {admins.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Нет администраторов</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Создание новых администраторов</p>
              <p className="text-sm text-muted-foreground">
                Новые администраторы автоматически создаются при первом входе через систему Replit Auth.
                Главный администратор может активировать или деактивировать учетные записи других администраторов.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAdmin?.isActive ? "Деактивировать" : "Активировать"} администратора?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите {selectedAdmin?.isActive ? "деактивировать" : "активировать"}{" "}
              учетную запись "{getUserDisplayName(selectedAdmin!)}"?
              {selectedAdmin?.isActive &&
                " Деактивированный администратор не сможет войти в систему."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-toggle">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedAdmin &&
                toggleAdminMutation.mutate({
                  id: selectedAdmin.id,
                  isActive: !selectedAdmin.isActive,
                })
              }
              data-testid="button-confirm-toggle"
            >
              {selectedAdmin?.isActive ? "Деактивировать" : "Активировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
