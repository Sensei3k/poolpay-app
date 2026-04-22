import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { IdentityStrip } from "./_components/identity-strip";
import {
  SettingsList,
  type SettingsItem,
} from "./_components/settings-list";

export const metadata: Metadata = {
  title: "Account · PoolPay",
  description: "Manage the details tied to your PoolPay sign-in.",
};

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    key: "password",
    title: "Change password",
    description:
      "Rotate your sign-in password. You'll be signed out of all other sessions.",
    href: "/account/change-password",
    available: true,
  },
  {
    key: "email",
    title: "Email address",
    description: "Change the address used for sign-in and notifications.",
    available: false,
    hint: "Coming soon",
  },
  {
    key: "sessions",
    title: "Active sessions",
    description:
      "Review devices currently signed in and revoke any you don't recognize.",
    available: false,
    hint: "Coming soon",
  },
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/signin");
  }

  const availableCount = SETTINGS_ITEMS.filter((i) => i.available).length;
  const comingCount = SETTINGS_ITEMS.length - availableCount;

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs
        trail={[
          { label: "Dashboard", href: "/" },
          { label: "Account" },
        ]}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage the details tied to your PoolPay sign-in.
        </p>
      </header>

      <IdentityStrip email={session.user.email} role={session.user.role} />

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
            Security
          </h2>
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
            {availableCount} available · {comingCount} coming
          </span>
        </div>
        <SettingsList items={SETTINGS_ITEMS} />
      </section>
    </div>
  );
}
