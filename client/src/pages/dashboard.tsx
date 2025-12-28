import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Person, Group, InsertPerson, InsertGroup } from "@shared/schema";
import { PassportCard } from "@/components/passport-card";
import { PassportForm } from "@/components/passport-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Users, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const { data: people = [], isLoading: peopleLoading } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const createPersonMutation = useMutation({
    mutationFn: async (data: InsertPerson & { photo?: File }) => {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("birthDate", data.birthDate);
      formData.append("passportNumber", data.passportNumber);
      formData.append("expirationDate", data.expirationDate);
      formData.append("notes", data.notes || "");
      formData.append("groupId", data.groupId.toString());
      formData.append("status", (data.status ?? true).toString());
      if (data.photo) {
        formData.append("photo", data.photo);
      }

      const response = await fetch("/api/people", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({ title: "Паспорт создан успешно" });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать паспорт",
        variant: "destructive",
      });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: async (data: InsertPerson & { id: number; photo?: File }) => {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("birthDate", data.birthDate);
      formData.append("passportNumber", data.passportNumber);
      formData.append("expirationDate", data.expirationDate);
      formData.append("notes", data.notes || "");
      formData.append("groupId", data.groupId.toString());
      formData.append("status", (data.status ?? true).toString());
      if (data.photo) {
        formData.append("photo", data.photo);
      }

      const response = await fetch(`/api/people/${data.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({ title: "Паспорт обновлен успешно" });
      setIsEditDialogOpen(false);
      setSelectedPerson(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить паспорт",
        variant: "destructive",
      });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/people/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({ title: "Паспорт удален успешно" });
      setIsDeleteDialogOpen(false);
      setSelectedPerson(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить паспорт",
        variant: "destructive",
      });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: InsertGroup) => {
      await apiRequest("POST", "/api/groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Группа создана успешно" });
      setIsGroupDialogOpen(false);
      setNewGroupName("");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать группу",
        variant: "destructive",
      });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      await apiRequest("PUT", `/api/groups/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Группа обновлена успешно" });
      setIsEditGroupDialogOpen(false);
      setSelectedGroupForEdit(null);
      setNewGroupName("");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить группу",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Группа удалена успешно" });
      setIsDeleteGroupDialogOpen(false);
      setSelectedGroupForEdit(null);
      setSelectedGroup(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить группу. Возможно, в группе есть паспорта",
        variant: "destructive",
      });
    },
  });

  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.passportNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === null || person.groupId === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const activePeople = filteredPeople.filter((p) => p.status);
  const inactivePeople = filteredPeople.filter((p) => !p.status);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-dashboard-title">
            Панель управления
          </h1>
          <p className="text-muted-foreground">
            Управление паспортами и группами
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setIsGroupDialogOpen(true)} variant="outline" data-testid="button-create-group">
            <Users className="w-4 h-4 mr-2" />
            Создать группу
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-passport">
            <Plus className="w-4 h-4 mr-2" />
            Создать паспорт
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего паспортов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-total-count">
              {people.length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider opacity-50">v1.2 (OnRender Ready)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400" data-testid="text-active-count">
              {activePeople.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Неактивных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400" data-testid="text-inactive-count">
              {inactivePeople.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Групп</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-groups-count">
              {groups.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или номеру паспорта..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedGroup === null ? "default" : "outline"}
            onClick={() => setSelectedGroup(null)}
            size="sm"
            data-testid="button-filter-all"
          >
            Все
          </Button>
          {groups.map((group) => (
            <div key={group.id} className="flex items-center gap-1">
              <Button
                variant={selectedGroup === group.id ? "default" : "outline"}
                onClick={() => setSelectedGroup(group.id)}
                size="sm"
                data-testid={`button-filter-group-${group.id}`}
              >
                {group.name}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedGroupForEdit(group);
                  setNewGroupName(group.name);
                  setIsEditGroupDialogOpen(true);
                }}
                data-testid={`button-edit-group-${group.id}`}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedGroupForEdit(group);
                  setIsDeleteGroupDialogOpen(true);
                }}
                data-testid={`button-delete-group-${group.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {inactivePeople.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-destructive">
            Неактивные паспорта ({inactivePeople.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactivePeople.map((person) => (
              <PassportCard
                key={person.id}
                person={person}
                onEdit={(p) => {
                  setSelectedPerson(p);
                  setIsEditDialogOpen(true);
                }}
                onDelete={(p) => {
                  setSelectedPerson(p);
                  setIsDeleteDialogOpen(true);
                }}
                onViewQR={(p) => {
                  setSelectedPerson(p);
                  setIsQRDialogOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {inactivePeople.length > 0 && (
          <h2 className="text-xl font-semibold">
            Активные паспорта ({activePeople.length})
          </h2>
        )}
        {peopleLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activePeople.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedGroup !== null
                  ? "Паспорты не найдены"
                  : "Создайте первый паспорт"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePeople.map((person) => (
              <PassportCard
                key={person.id}
                person={person}
                onEdit={(p) => {
                  setSelectedPerson(p);
                  setIsEditDialogOpen(true);
                }}
                onDelete={(p) => {
                  setSelectedPerson(p);
                  setIsDeleteDialogOpen(true);
                }}
                onViewQR={(p) => {
                  setSelectedPerson(p);
                  setIsQRDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать новый паспорт</DialogTitle>
          </DialogHeader>
          <PassportForm
            groups={groups}
            onSubmit={(data) => createPersonMutation.mutateAsync(data)}
            isLoading={createPersonMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать паспорт</DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <PassportForm
              groups={groups}
              defaultValues={{
                ...selectedPerson,
                id: selectedPerson.id,
              }}
              onSubmit={(data) =>
                updatePersonMutation.mutateAsync({ ...data, id: selectedPerson.id })
              }
              isLoading={updatePersonMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить паспорт?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить паспорт "{selectedPerson?.fullName}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPerson && deletePersonMutation.mutate(selectedPerson.id)}
              data-testid="button-confirm-delete"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR-код паспорта</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {selectedPerson?.qrCodeUrl ? (
              <>
                <img
                  src={selectedPerson.qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64"
                  data-testid="img-qr-code"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Публичная ссылка:{" "}
                  <a
                    href={`/p/${selectedPerson.publicId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-public-passport"
                  >
                    {window.location.origin}/p/{selectedPerson.publicId}
                  </a>
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">QR-код генерируется...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую группу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Название группы"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              data-testid="input-group-name"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (newGroupName.trim()) {
                    createGroupMutation.mutate({ name: newGroupName, createdBy: "admin_user" });
                  }
                }}
                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                data-testid="button-submit-group"
              >
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Название группы"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              data-testid="input-edit-group-name"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditGroupDialogOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (selectedGroupForEdit && newGroupName.trim()) {
                    updateGroupMutation.mutate({
                      id: selectedGroupForEdit.id,
                      name: newGroupName,
                    });
                  }
                }}
                disabled={!newGroupName.trim() || updateGroupMutation.isPending}
                data-testid="button-save-group"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteGroupDialogOpen} onOpenChange={setIsDeleteGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить группу?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить группу "{selectedGroupForEdit?.name}"?
              Все паспорта в этой группе останутся, но потеряют привязку к ней.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedGroupForEdit && deleteGroupMutation.mutate(selectedGroupForEdit.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
