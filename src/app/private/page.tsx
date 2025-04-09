import Link from "next/link";
import React from "react";

import { getCurrentUser } from "@/auth/current-user";
import { Button } from "@/components/ui/button";

import ToggleRoleButton from "./toggle-role-button";

const PrivatePage = async () => {
  const currentUser = await getCurrentUser({ redirectIfNotFound: true });
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-4xl">Private Page: {currentUser.role}</h1>
      <ToggleRoleButton />
      <Button asChild>
        <Link href="/">Home</Link>
      </Button>
    </div>
  );
};

export default PrivatePage;
