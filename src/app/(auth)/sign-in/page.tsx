import React from "react";

import SignInForm from "@/auth/nextjs/sign-in-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SignInPage = () => {
  return (
    <div className="container mx-auto max-w-[750px] p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
