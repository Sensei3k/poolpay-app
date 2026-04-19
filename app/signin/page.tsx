import { Suspense } from "react";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <main className="bg-background flex min-h-screen w-full justify-center px-5 pt-12 pb-10 sm:px-6 sm:pt-[120px]">
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
