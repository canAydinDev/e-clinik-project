import { UserRegistrationForm } from "@/modules/ui/components/patient-page/user-registraiton-form";
import React from "react";

const Page = () => {
  return (
    <div className=" mx-10 ">
      <div>Patient Registration</div>
      <div>
        <UserRegistrationForm />
      </div>
    </div>
  );
};

export default Page;
