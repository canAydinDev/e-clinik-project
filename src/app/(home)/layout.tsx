import { Footer } from "@/modules/ui/components/home-page/footer";
import { Navbar } from "@/modules/ui/components/home-page/navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-[#e6ddde]">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
