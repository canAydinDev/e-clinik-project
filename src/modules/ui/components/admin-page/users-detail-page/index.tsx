"use client";

import { useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";

import { Form } from "@/components/ui/form";
import { CustomFormField } from "@/modules/ui/components/patient-page/custom-form-field";
import { SubmitButton } from "@/modules/ui/components/patient-page/submit-button";
import { FormFieldType } from "@/modules/ui/components/patient-page/patient-form";

/* ------------ Tipler ------------- */
type AppUser = {
  $id: string;
  name: string;
  email: string;
  phone?: string | null;
};

/* ------------ Zod şema (update) ------------- */
const UpdateUserValidation = z
  .object({
    name: z.string().min(1, "İsim zorunludur"),
    email: z.string().email("Geçerli e-posta giriniz"),
    phone: z.string().optional().or(z.literal("")),
    password: z
      .string()
      .min(6, "En az 6 karakter")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (vals) =>
      (vals.password?.length ?? 0) === 0 ||
      vals.password === vals.confirmPassword,
    { message: "Şifreler eşleşmiyor", path: ["confirmPassword"] }
  );

type UpdateUserValues = z.infer<typeof UpdateUserValidation>;

/* ------------ Düzenleme Formu ------------- */
function UserEditForm({
  user,
  onSuccess,
  onCancel,
}: {
  user: AppUser;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    ...trpc.users.update.mutationOptions(),
    onSuccess: () => {
      // listeyi tazele
      queryClient.invalidateQueries({
        queryKey: trpc.users.getMany.queryKey(),
      });
      toast.success("Kullanıcı güncellendi");
      onSuccess();
    },
    onError: () => {
      toast.error("Kullanıcı güncellenemedi");
    },
  });

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(UpdateUserValidation),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: UpdateUserValues) => {
    await updateMutation.mutateAsync({
      userId: user.$id,
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      ...(values.password ? { password: values.password } : {}),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <CustomFormField<UpdateUserValues>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="İsim"
          placeholder="Ad Soyad"
        />
        <CustomFormField<UpdateUserValues>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="E-posta"
          placeholder="ornek@eposta.com"
        />
        <CustomFormField<UpdateUserValues>
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Telefon"
          placeholder="(555) 123-4567"
        />

        <div className="pt-2">
          <h3 className="text-sm font-medium mb-2">
            Şifreyi Değiştir (opsiyonel)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomFormField<UpdateUserValues>
              fieldType={FormFieldType.PASSWORD}
              control={form.control}
              name="password"
              label="Yeni Şifre"
              placeholder="******"
            />
            <CustomFormField<UpdateUserValues>
              fieldType={FormFieldType.PASSWORD}
              control={form.control}
              name="confirmPassword"
              label="Yeni Şifre (Tekrar)"
              placeholder="******"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Vazgeç
          </Button>
          <SubmitButton isLoading={updateMutation.isPending}>
            Kaydet
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}

/* ------------ Liste + Aksiyonlar ------------- */
export const UsersDetailsPage = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.users.getMany.queryOptions());
  const users = useMemo<AppUser[]>(
    () =>
      (data ?? [])
        .filter((u) => (u.name ?? "").toLowerCase() !== "admin") // ← admin'i çıkar
        .map((u) => ({
          $id: u.$id,
          name: u.name,
          email: u.email,
          phone: (u as { phone?: string | null }).phone ?? null,
        })),
    [data]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    ...trpc.users.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.users.getMany.queryKey(),
      });
      toast.success("Kullanıcı silindi");
    },
    onError: () => toast.error("Kullanıcı silinemedi"),
  });

  const startEdit = (u: AppUser) => {
    setEditing(u);
    setEditOpen(true);
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const doDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync({ userId: deleteId });
    setDeleteId(null);
  };

  return (
    <section className="w-full">
      <h1 className="text-lg font-semibold mb-3">Kullanıcılar</h1>

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İsim</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="w-[160px] text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Yükleniyor…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.$id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(u)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Düzenle
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete(u.$id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Sil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Düzenleme Diyaloğu */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
          </DialogHeader>

          {editing && (
            <UserEditForm
              user={editing}
              onSuccess={() => {
                setEditOpen(false);
                setEditing(null);
              }}
              onCancel={() => {
                setEditOpen(false);
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Silme Onayı */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcı kalıcı olarak silinecek. Bu işlemi geri alamazsınız.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={doDelete}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
