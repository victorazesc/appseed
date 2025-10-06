import { redirect } from "next/navigation";

import { authEnabled } from "@/lib/auth";

import { SignInClient } from "./signin-client";

export default function SignInPage() {
  if (!authEnabled) {
    redirect("/");
  }

  return <SignInClient />;
}
