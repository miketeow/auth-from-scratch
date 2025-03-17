import React from "react";

import { SignUpForm } from "@/auth/nextjs/sign-up-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SignUpPage = () => {
  return (
    <div className="container mx-auto max-w-[750px] p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
