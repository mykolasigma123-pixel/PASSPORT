import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import type { Person } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { Calendar, FileText, Hash, Shield } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicPassport() {
  const [, params] = useRoute("/p/:publicId");
  const publicId = params?.publicId;

  const { data: person, isLoading, error } = useQuery<Person>({
    queryKey: ["/api/public/people", publicId],
    enabled: !!publicId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Паспорт не найден</h1>
            <p className="text-muted-foreground">
              Паспорт с указанным идентификатором не существует или был удален.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-8 py-12">
        <Card>
          <CardHeader className="text-center space-y-6 pb-8">
            <Avatar className="w-32 h-32 mx-auto">
              <AvatarImage src={person.photoUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-3xl">{getInitials(person.fullName)}</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-semibold mb-4" data-testid="text-public-name">
                {person.fullName}
              </h1>
              <div className="flex justify-center">
                <StatusBadge active={person.status} size="lg" />
              </div>
            </div>

            {!person.status && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                <p className="text-destructive font-medium text-center">
                  Паспорт неактивен
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Срок действия истек
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Дата рождения</span>
                </div>
                <p className="text-lg font-medium" data-testid="text-birth-date">
                  {format(new Date(person.birthDate), "dd MMMM yyyy", { locale: ru })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>Номер паспорта</span>
                </div>
                <p className="text-lg font-medium" data-testid="text-passport-number">
                  {person.passportNumber}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Срок действия</span>
                </div>
                <p
                  className={`text-lg font-medium ${
                    !person.status ? "text-destructive" : ""
                  }`}
                  data-testid="text-expiration-date"
                >
                  {format(new Date(person.expirationDate), "dd MMMM yyyy", { locale: ru })}
                </p>
              </div>
            </div>

            {person.notes && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Примечания</span>
                </div>
                <p className="text-sm leading-relaxed" data-testid="text-notes">
                  {person.notes}
                </p>
              </div>
            )}

            {person.qrCodeUrl && (
              <div className="flex justify-center pt-6">
                <img
                  src={person.qrCodeUrl}
                  alt="QR Code"
                  className="w-40 h-40"
                  data-testid="img-public-qr-code"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 inline-block mr-1" />
          Система управления паспортами
        </div>
      </div>
    </div>
  );
}
