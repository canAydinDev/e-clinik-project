"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import { Form } from "@/components/ui/form";
import { CustomFormField } from "../custom-form-field";
import { SubmitButton } from "../submit-button";

import { UserFormValidation } from "@/lib/validation";
import { createUser } from "@/lib/actions/patient.actions";
import { FormFieldType } from "../patient-form";
import { UserFormData } from "../../../../../../types/form";

export const UserRegistrationForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 🔽 eklendi
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const form = useForm<UserFormData>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: UserFormData) {
    const { name, email, phone, password } = data;
    setIsLoading(true);

    try {
      const user = await createUser({ name, email, phone, password });
      if (user) {
        const { queryKey } = trpc.users.getMany.queryOptions();
        await queryClient.invalidateQueries({ queryKey });

        // 🔽 yönlendir ve SSR/Suspense yenile (gerekli ise)
        router.push("/admin/users");
        router.refresh();
      }
    } catch (error) {
      console.error("Kullanıcı oluşturulurken hata:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex-1 m-3"
      >
        <section className="mb-2 space-y-4 ">
          <h1>Yeni Kayıt</h1>
        </section>

        <CustomFormField<UserFormData>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="İsminiz"
          placeholder="Adı Soyadı"
          iconSrc="/assets/icons/user-2.svg"
          iconAlt="isim"
        />

        <CustomFormField<UserFormData>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="adiniz@gmail.com"
          iconSrc="/assets/icons/email-3.svg"
          iconAlt="email"
        />

        <CustomFormField<UserFormData>
          fieldType={FormFieldType.PASSWORD}
          control={form.control}
          name="password"
          label="Şifre"
          placeholder="******"
        />

        <CustomFormField<UserFormData>
          fieldType={FormFieldType.PASSWORD}
          control={form.control}
          name="confirmPassword"
          label="Şifre Tekrar"
          placeholder="******"
        />

        <CustomFormField<UserFormData>
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Telefon No"
          placeholder="(555) 123-4567"
        />

        <SubmitButton isLoading={isLoading}>Kaydet</SubmitButton>
      </form>
    </Form>
  );
};
