import { AestheticBackground } from "@/components/ui/aesthetic-background";

const AuthLayout = ({ children }: Readonly<React.PropsWithChildren>) => (
  <div className="flex flex-col items-center justify-center h-screen">
    {children}
    <AestheticBackground className="h-full from-white/0! via-white/0!" />
  </div>
);

export default AuthLayout;
