import { NewExaminationPage } from "../new-examination-page";

interface ExaminationPageProps {
  patientId: string;
}

export const ExaminationPage = ({ patientId }: ExaminationPageProps) => {
  return <NewExaminationPage patientId={patientId} />;
};
