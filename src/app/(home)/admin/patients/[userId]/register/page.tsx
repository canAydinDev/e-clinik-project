import { getUser } from "@/lib/actions/patient.actions";
import { RegisterForm } from "@/modules/ui/components/patient-page/register-form";

interface RegisterProps {
  params: Promise<{ userId: string }>;
}

const Register = async ({ params }: RegisterProps) => {
  const { userId } = await params;
  const user = await getUser(userId);
  return (
    <div className="mx-10">
      <div className="flex h-screen max-h-screen">
        <section className="remove-scrollbar container ">
          <div>
            <RegisterForm user={user} />

            <p className="copyright py-4 md:py-12">© 2024 BizimKlinik</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
