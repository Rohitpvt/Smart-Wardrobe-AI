"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AmbientGlow() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[60%] bg-brand-purple/10 blur-[150px] rounded-full mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[150px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-purple/5 blur-[150px] rounded-full mix-blend-screen" />
    </div>
  );
}
