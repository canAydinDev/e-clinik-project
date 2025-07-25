import { AdminNavbar } from "@/modules/ui/components/admin-page/adminNavbar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div>
      <AdminNavbar />
      {children}
    </div>
  );
};
export default Layout;
