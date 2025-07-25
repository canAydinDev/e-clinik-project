"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Form } from "@/components/ui/form";

import { signIn, getCurrentUser } from "@/lib/client/auth";
import { CustomFormField } from "./patient-page/custom-form-field";
import { SubmitButton } from "./patient-page/submit-button";

export enum FormFieldType {
  INPUT = "input",
  PASSWORD = "password",
}

const LoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.push("/dashboard");
        }
      } catch {
        // Kullanıcı giriş yapmamış → form gösterilmeye devam edilir
      }
    };

    checkSession();
  }, [router]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Giriş başarısız: " + (err || "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <h1 className="text-2xl font-bold">Giriş Yapınız...</h1>
        <p className="text-sm text-gray-500">
          Bilgilerinizi girerek giriş yapın
        </p>

        {error && <p className="text-red-500">{error}</p>}

        <CustomFormField<LoginFormData>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="adiniz@email.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        <CustomFormField<LoginFormData>
          fieldType={FormFieldType.PASSWORD}
          control={form.control}
          name="password"
          label="Şifre"
          placeholder="••••••••"
          iconSrc="/assets/icons/lock.svg"
          iconAlt="şifre"
        />

        <SubmitButton isLoading={isLoading}>Giriş Yap</SubmitButton>
      </form>
    </Form>
  );
};
