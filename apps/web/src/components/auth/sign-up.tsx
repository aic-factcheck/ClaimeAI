import { SignUp as ClerkSignUp } from "@clerk/nextjs";

export const SignUp = () => (
  <div className="relative">
    <div className="absolute top-0 z-20 bg-gradient-to-r from-white/0 via-neutral-200 to-white/0 h-px w-full" />
    <ClerkSignUp
      appearance={{
        elements: {
          cardBox: "shadow-sm!",
          footer: "[&>div:last-child]:hidden!",
        },
      }}
    />
  </div>
);
