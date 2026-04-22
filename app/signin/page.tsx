import { Suspense } from "react";
import { SignInEditorialPanel } from "./signin-editorial-panel";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <main
      id="main-content"
      className="bg-background grid min-h-dvh w-full lg:grid-cols-[1fr_480px]"
    >
      <SignInEditorialPanel />
      <div className="flex w-full items-center justify-center px-5 py-8 sm:px-6 sm:py-12 lg:px-[60px] lg:py-[72px]">
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
