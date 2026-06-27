import Link from "next/link";

import { isSupabaseConfigured } from "@/lib/env";
import { DemoAuthNotice } from "@/components/auth/demo-auth-notice";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign up — Canvas" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  if (!isSupabaseConfigured) {
    return <DemoAuthNotice />;
  }

  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-muted-foreground text-sm">Start building AI image workflows</p>
      </div>
      <SignupForm redirectTo={redirectTo ?? "/projects"} />
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          className="text-foreground font-medium underline-offset-4 hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
