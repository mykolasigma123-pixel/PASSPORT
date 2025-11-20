import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { ActivityLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLogPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: logs = [], isLoading } = useQuery<
    Array<ActivityLog & { performedByUser?: { firstName?: string; lastName?: string; email?: string } }>
  >({
    queryKey: ["/api/activity-logs"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const getUserName = (log: typeof logs[0]) => {
    if (log.performedByUser?.firstName || log.performedByUser?.lastName) {
      return `${log.performedByUser.firstName || ""} ${log.performedByUser.lastName || ""}`.trim();
    }
    return log.performedByUser?.email || "Администратор";
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-activity-title">
          Журнал изменений
        </h1>
        <p className="text-muted-foreground">
          История всех действий в системе
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Последние действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Нет записей в журнале</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 rounded-md hover-elevate"
                  data-testid={`log-entry-${index}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium" data-testid={`log-action-${index}`}>
                      {log.action}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span data-testid={`log-user-${index}`}>{getUserName(log)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span data-testid={`log-time-${index}`}>
                          {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm", { locale: ru })}
                        </span>
                      </div>
                      {log.details && (
                        <span className="text-muted-foreground/70">
                          {JSON.stringify(log.details)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
