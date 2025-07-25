"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/client/auth";
import { getAllPatients } from "@/lib/actions/patient.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Models } from "appwrite";

const Dashboard = () => {
  const [patients, setPatients] = useState<Models.Document[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchUserAndPatients = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const allPatients = await getAllPatients();
        setPatients(allPatients);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPatients();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        <strong>Ad:</strong> {user?.name}
      </p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>
      <p>
        <strong>Kullanıcı ID:</strong> {user?.$id}
      </p>

      <Button onClick={handleLogout}>Çıkış Yap</Button>

      <div>
        <Button asChild>
          <Link href={`/patients/${user?.$id}/register`}>Yeni Kayıt</Link>
        </Button>
      </div>

      <div>
        <h1>Hastalar</h1>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <div key={patient.$id} className="flex gap-2 border mx-10">
              <div>{patient.name || "İsimsiz Hasta"}</div>
              <div>{patient.email || "Bilinmeyen Email"}</div>
              <Link href={`/patient/${patient.$id}`}>Sayfası</Link>
            </div>
          ))
        ) : (
          <p>Hiç hasta bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
