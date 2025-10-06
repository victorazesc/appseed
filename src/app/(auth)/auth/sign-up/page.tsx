import { redirect } from "next/navigation";

import { authEnabled } from "@/lib/auth";
import { SignUpClient } from "./signup-client";

export default function SignUpPage() {
  if (!authEnabled) {
    redirect("/");
  }

  return <SignUpClient />;
}
