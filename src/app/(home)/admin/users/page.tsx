import { UserManagementPage } from "@/modules/ui/components/admin-page/userManagementPage";
import { UsersDetailsPage } from "@/modules/ui/components/admin-page/users-detail-page";

const Page = () => {
  return (
    <div className="flex flex-col lg:flex-row mx-5 justify-between items-center ">
      <div className=" flex-1 lg:flex-1 w-full">
        <UserManagementPage />
      </div>
      <div className="flex-1 lg:flex-3 w-full ">
        <div className=" mx-2 ">
          <UsersDetailsPage />
        </div>
      </div>
    </div>
  );
};

export default Page;
