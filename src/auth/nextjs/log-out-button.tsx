"use client";

import React from "react";

import { Button } from "@/components/ui/button";

import { logOut } from "../actions";

const LogOutButton = () => {
  return (
    <Button variant="destructive" onClick={async () => await logOut()}>
      Log Out
    </Button>
  );
};

export default LogOutButton;
