import { Suspense } from "react";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <main
      id="main-content"
      className="bg-background grid min-h-dvh w-full place-items-center px-5 py-8 sm:px-6 sm:py-12"
    >
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
