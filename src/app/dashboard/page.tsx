import { redirect } from "next/navigation";

export default function DashboardRedirectPage() {
  redirect("/auth/post-login");
}

