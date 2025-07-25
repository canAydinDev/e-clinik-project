import { UserManagementPage } from "@/modules/ui/components/admin-page/userManagementPage";
import { UsersDetailsPage } from "@/modules/ui/components/admin-page/users-detail-page";

const Page = () => {
  return (
    <div className="flex flex-row mx-5 justify-between items-center ">
      <div className="flex-1 ">
        <UserManagementPage />
      </div>
      <div className="flex-5 ">
        <div>
          <h1>Tum Kullanicilar</h1>
          <div>
            <UsersDetailsPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
