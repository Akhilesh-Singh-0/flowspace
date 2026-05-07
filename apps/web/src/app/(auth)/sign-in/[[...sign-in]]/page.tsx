import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0F11]">
      <SignIn
        appearance={{ baseTheme: dark }}
        fallbackRedirectUrl="/workspaces"
      />
    </div>
  );
}