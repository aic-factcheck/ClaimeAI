import { AppSidebar } from "@/components/nav/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: Readonly<React.PropsWithChildren>) => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>{children}</SidebarInset>
  </SidebarProvider>
);

export default DashboardLayout;
