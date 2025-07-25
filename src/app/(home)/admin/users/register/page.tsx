import { UserRegistrationForm } from "@/modules/ui/components/patient-page/user-registraiton-form";
import React from "react";

const Page = () => {
  return (
    <div className=" mx-10 ">
      <div>Yeni Kullanici Kaydi</div>
      <div>
        <UserRegistrationForm />
      </div>
    </div>
  );
};

export default Page;
