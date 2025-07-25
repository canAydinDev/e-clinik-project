import { PatientsHomePage } from "@/modules/ui/components/patient-page/patients-home-page";

const Page = () => {
  return (
    <section>
      <div className="flex flex-row mx-3 justify-between items-center ">
        <div className="flex-1">Hasta islemleri</div>
        <div className="flex-5">
          <PatientsHomePage />
        </div>
      </div>
    </section>
  );
};

export default Page;
