import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PPShellRoute } from "@/components/layout/pp-shell-route";

function deriveInitial(displayName: string): string {
  const first = displayName.trim().charAt(0);
  return first ? first.toUpperCase() : "·";
}

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  const { name, email, role } = session.user;
  const displayName = name?.trim() || email || "Member";
  const displayEmail = email ?? "";

  return (
    <PPShellRoute
      role={role}
      user={{
        name: displayName,
        email: displayEmail,
        initial: deriveInitial(displayName),
      }}
    >
      {children}
    </PPShellRoute>
  );
}
