"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster"; // ou ta lib de toast

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
