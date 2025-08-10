import { LoginForm } from "@/modules/ui/components/LoginPage";
import { PasskeyModal } from "@/modules/ui/pas-key";
import Image from "next/image";
import Link from "next/link";

// Temel beklenti: searchParams bir Promise döndürür
interface PageProps {
  searchParams?: Promise<{ admin?: string }>;
}

const Home = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const isAdmin = params?.admin === "true";

  return (
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PasskeyModal />}

      <section className="container my-auto">
        <div className="mx-auto flex size-full flex-col py-10 max-w-[496px]">
          <div className="flex items-center justify-center mx-auto my-10 text-2xl">
            <h1>
              <span className="font-bold">Ş</span>AHIN{" "}
              <span className="font-semibold text-green-300">KLINIK</span>
            </h1>
          </div>
          <LoginForm />

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-gray-600 xl:text-left">
              © 2025 ŞahinKlinik
            </p>
            <Link href="/?admin=true" className="text-green-600">
              Yönetim Paneli
            </Link>
          </div>
        </div>
      </section>
      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="hasta"
        className="side-img max-w-[50%]"
      />
    </div>
  );
};

export default Home;
