import { Button } from "@/components/ui/button";
import { getPatientById } from "@/lib/actions/patient.actions";
import { PatientDetailPage } from "@/modules/ui/components/patient-page/patient-detail-page";
import Image from "next/image";
import Link from "next/link";

interface PatientProps {
  params: Promise<{ patientId: string }>;
}

const Patient = async ({ params }: PatientProps) => {
  function extractDobISO(obj: unknown): string | null {
    if (!obj || typeof obj !== "object") return null;
    const rec = obj as Record<string, unknown>;
    const keys = ["birthDate", "dateOfBirth", "dob"] as const;
    for (const k of keys) {
      const v = rec[k];
      if (typeof v === "string" && v.trim().length > 0) return v;
    }
    return null;
  }

  function calcAgeFromISO(dobISO: string): number | null {
    const dob = new Date(dobISO);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age >= 0 ? age : null;
  }

  const { patientId } = await params;
  const patient = await getPatientById(patientId);

  if (!patient) {
    return <div>Hasta bulunamadı.</div>;
  }

  const dobISO = extractDobISO(patient);
  const age = dobISO ? calcAgeFromISO(dobISO) : null;

  return (
    <div className="flex flex-col justify-between mx-4  p-3">
      <div className="flex flex-row justify-between items-center mb-5  min-h-[50px] px-5 ">
        <div className="flex flex-col justify-center items-center">
          <div>
            <Link
              className="font-bold text-xl"
              href={`/admin/patient/${patientId}`}
              title={
                dobISO
                  ? `Doğum tarihi: ${new Date(dobISO).toLocaleDateString(
                      "tr-TR"
                    )}`
                  : undefined
              }
            >
              {patient.name}
            </Link>
          </div>
          <div className="flex flex-col justify-center items-start  mt-2 w-full ">
            <div>
              {" "}
              {typeof age === "number" && (
                <span className=" text-base text-gray-600">Yaş: {age}</span>
              )}
            </div>
            <div>TC: {patient.identificationNumber}</div>
          </div>
        </div>

        <div>
          {patient.faceUrl ? (
            <Image
              src={patient.faceUrl}
              alt="Hasta Fotoğrafı"
              width={100}
              height={100}
              className="rounded-full object-cover"
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <p>Fotoğraf yok</p>
          )}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-0  ">
        <div className="flex lg:flex-[1]">
          <PatientDetailPage patientId={patientId} />
        </div>
        <div className="flex flex-col lg:flex-[2]">
          <div className="flex  flex-row gap-2 items-center justify-center mt-5  ">
            <div>
              <Button asChild variant="elevated">
                <Link href={`/admin/appointments/${patientId}`}>
                  Randevu Al
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patient;
