"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

import { Appointment } from "../../../../../../types/appwrite.types";
import { AppointmentForm } from "../../appointment-page/appointment-form";

interface AppointmentModalProps {
  type: "schedule" | "cancel";
  patientId: string;
  userId: string;
  appointment?: Appointment;
}

export const AppointmentModal = ({
  type,
  patientId,
  userId,
  appointment,
}: AppointmentModalProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${
            type === "schedule" ? "text-green-500" : "text-red-500"
          }`}
        >
          {type === "schedule" ? <p>Planla</p> : <p>İptal et</p>}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize" asChild>
            {type === "schedule" ? (
              <p>Randevu oluştur</p>
            ) : (
              <p>Randevuyu iptal et</p>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            {type === "schedule" ? (
              <p>
                Lütfen randevu oluşturmak için aşağıdaki bilgileri doldurun.
              </p>
            ) : (
              <p>
                Lütfen randevuyu iptal etmek için aşağıdaki bilgileri doldurun.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
