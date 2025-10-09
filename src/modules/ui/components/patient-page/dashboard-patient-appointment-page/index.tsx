// components/tables/PatientAppointmentsTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPatientAppointmentList } from "@/lib/actions/appointment.actions";
// 👈 DEĞİŞİKLİK: 'Status' import'u kaldırıldı, 'Appointment' import edildi.
import { Appointment } from "../../../../../../types/appwrite.types";

// Randevu durumlarına göre Badge renklerini belirleyen bir yardımcı obje
// 💡 Not: Status global bir tip olduğu için burada doğrudan kullanabiliriz.
const StatusBadgeVariants: Record<
  Status,
  "default" | "secondary" | "destructive"
> = {
  scheduled: "default",
  pending: "secondary",
  cancelled: "destructive",
};

interface PatientAppointmentsTableProps {
  patientId: string;
}

const PatientAppointmentsTable = async ({
  patientId,
}: PatientAppointmentsTableProps) => {
  // getPatientAppointmentList'in Models.DocumentList<Appointment> döndürdüğünü varsayıyoruz.
  const appointmentsData = await getPatientAppointmentList(patientId);

  if (!appointmentsData || appointmentsData.documents.length === 0) {
    return (
      <div className="mt-10 text-center text-gray-500">
        Bu hastaya ait randevu bulunamadı.
      </div>
    );
  }

  // 👈 DEĞİŞİKLİK: Gelen veriyi doğru tiple eşleştiriyoruz.
  const appointments: Appointment[] = appointmentsData.documents;

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Geçmiş Randevular</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih ve Saat</TableHead>
            <TableHead>Randevu Sebebi</TableHead>
            <TableHead>Randevu Notu</TableHead>
            <TableHead className="text-right">Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 👈 DEĞİŞİKLİK: 'appointment' artık 'any' değil, 'Appointment' tipinde. */}
          {appointments.map((appointment) => (
            <TableRow key={appointment.$id}>
              <TableCell>
                {new Date(appointment.schedule).toLocaleString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>{appointment.reason}</TableCell>
              <TableCell>{appointment.note}</TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={StatusBadgeVariants[appointment.status] || "outline"}
                >
                  {/* Durum metnini daha okunabilir yapmak için (isteğe bağlı) */}
                  {appointment.status === "scheduled"
                    ? "Planlandı"
                    : appointment.status === "pending"
                    ? "Beklemede"
                    : "İptal Edildi"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientAppointmentsTable;
