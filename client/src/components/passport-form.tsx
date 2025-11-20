import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonSchema, type InsertPerson } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PassportFormProps {
  defaultValues?: Partial<InsertPerson & { id?: number }>;
  onSubmit: (data: InsertPerson & { photo?: File }) => Promise<void>;
  isLoading: boolean;
  groups: Array<{ id: number; name: string }>;
}

export function PassportForm({ defaultValues, onSubmit, isLoading, groups }: PassportFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.photoUrl || null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<InsertPerson>({
    resolver: zodResolver(insertPersonSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || "",
      birthDate: defaultValues?.birthDate || "",
      passportNumber: defaultValues?.passportNumber || "",
      expirationDate: defaultValues?.expirationDate || "",
      notes: defaultValues?.notes || "",
      groupId: defaultValues?.groupId || groups[0]?.id,
      status: defaultValues?.status ?? true,
      photoUrl: defaultValues?.photoUrl || "",
      createdBy: defaultValues?.createdBy || "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: InsertPerson) => {
    await onSubmit({ ...data, photo: photoFile || undefined });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={photoPreview || undefined} className="object-cover" />
            <AvatarFallback className="text-2xl">
              {form.watch("fullName") ? getInitials(form.watch("fullName")) : "ФИ"}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-upload-photo"
          >
            <Upload className="w-4 h-4 mr-2" />
            Загрузить фото
          </Button>
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input
                  placeholder="Иванов Иван Иванович"
                  {...field}
                  data-testid="input-full-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата рождения</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-birth-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passportNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Номер паспорта</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1234 567890"
                    {...field}
                    data-testid="input-passport-number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Срок действия</FormLabel>
              <FormControl>
                <Input type="date" {...field} data-testid="input-expiration-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Группа</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="select-group"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Примечания</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Дополнительная информация..."
                  className="min-h-24"
                  {...field}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end pt-4">
          <Button type="submit" disabled={isLoading} data-testid="button-submit-passport">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {defaultValues?.id ? "Сохранить изменения" : "Создать паспорт"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
