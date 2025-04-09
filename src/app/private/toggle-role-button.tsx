"use client";

import React from "react";

import { Button } from "@/components/ui/button";

import { toggleRole } from "../actions/toggle-role";

const ToggleRoleButton = () => {
  return <Button onClick={toggleRole}>Toggle Role</Button>;
};

export default ToggleRoleButton;
