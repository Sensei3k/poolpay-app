import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Change password · PoolPay",
  description:
    "Rotate your sign-in password. Requires the current password to confirm it's you.",
};

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-[30rem] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <Breadcrumbs
        trail={[
          { label: "Dashboard", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Change password" },
        ]}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Change password
        </h1>
        <p className="text-sm text-muted-foreground">
          Rotate your sign-in password. Needs your current password to confirm
          it&apos;s you.
        </p>
      </header>

      <ChangePasswordForm />
    </main>
  );
}
