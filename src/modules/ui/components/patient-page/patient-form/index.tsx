"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";

import { CustomFormField } from "../custom-form-field";
import { SubmitButton } from "../submit-button";
import { useState } from "react";
import { UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import { UserFormData } from "../../../../../../types/form";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  PASSWORD = "password",
}

export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "can@demo.com",
      phone: "",
      password: "",
    },
  });

  async function onSubmit({
    name,
    email,
    phone,
    password,
  }: z.infer<typeof UserFormValidation>) {
    console.log("tikliyor");
    try {
      setIsLoading(true);
      const userData = { name, email, phone, password };
      const user = await createUser(userData);
      if (user) {
        router.push(`/patients/${user.$id}/register`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section>
          <h1 className="header">Merhaba 👋 </h1>
          <p className="text-gray-400">ilk randevunuzu alın...</p>
        </section>
        <CustomFormField<UserFormData>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Adı Soyadı"
          placeholder="Adı Soyadı"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <CustomFormField<UserFormData>
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="adiniz@email.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />
        <CustomFormField<UserFormData>
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Tel"
          placeholder="(555) 123-4567"
        />
        <SubmitButton isLoading={isLoading}>Şimdi Kaydolun...</SubmitButton>
      </form>
    </Form>
  );
};
