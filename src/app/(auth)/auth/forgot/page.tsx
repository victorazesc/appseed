import { redirect } from "next/navigation";

import { authEnabled } from "@/lib/auth";
import { ForgotPasswordClient } from "./forgot-client";

export default function ForgotPasswordPage() {
  if (!authEnabled) {
    redirect("/");
  }

  return <ForgotPasswordClient />;
}
