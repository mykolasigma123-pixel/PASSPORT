import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Edit, Trash2, QrCode, Calendar, FileText } from "lucide-react";
import type { Person } from "@shared/schema";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface PassportCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onViewQR: (person: Person) => void;
}

export function PassportCard({ person, onEdit, onDelete, onViewQR }: PassportCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isExpiringSoon = () => {
    if (!person.status) return false;
    const expDate = new Date(person.expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <Card
      className={`hover-elevate ${!person.status ? "border-destructive/50 bg-destructive/5" : ""}`}
      data-testid={`card-passport-${person.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={person.photoUrl || undefined} className="object-cover" />
            <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-base" data-testid={`text-name-${person.id}`}>
              {person.fullName}
            </h3>
            <p className="text-sm text-muted-foreground">№ {person.passportNumber}</p>
          </div>
        </div>
        <StatusBadge active={person.status} />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Дата рождения:</span>
          <span>{format(new Date(person.birthDate), "dd.MM.yyyy", { locale: ru })}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Срок действия:</span>
          <span
            className={
              !person.status
                ? "text-destructive font-medium"
                : isExpiringSoon()
                ? "text-orange-600 dark:text-orange-400 font-medium"
                : ""
            }
          >
            {format(new Date(person.expirationDate), "dd.MM.yyyy", { locale: ru })}
          </span>
        </div>

        {person.notes && (
          <div className="flex items-start gap-2 text-sm mt-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-muted-foreground line-clamp-2">{person.notes}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewQR(person)}
          data-testid={`button-view-qr-${person.id}`}
        >
          <QrCode className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(person)}
          data-testid={`button-edit-${person.id}`}
        >
          <Edit className="w-4 h-4 mr-2" />
          Редактировать
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(person)}
          data-testid={`button-delete-${person.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
