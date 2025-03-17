import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const PrivatePage = () => {
  const currentUser = { role: "user" };
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-4xl">Private Page: {currentUser.role}</h1>
      <Button asChild>
        <Link href="/">Home</Link>
      </Button>
    </div>
  );
};

export default PrivatePage;
