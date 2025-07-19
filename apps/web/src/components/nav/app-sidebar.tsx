"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { HomeIcon, type HomeIconHandle } from "../ui/icons/home";
import { PlusIcon, type PlusIconHandle } from "../ui/icons/plus";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { AboutDialog } from "./about-dialog";
import { HowItWorksDialog } from "./how-it-works-dialog";
import { AppSidebarFooter } from "./sidebar-footer";

const mainItems = [
  {
    title: "Fact Checker",
    url: "/",
    icon: HomeIcon,
    description: "Main fact-checking interface",
  },
  {
    title: "New Check",
    url: "/?clear=true",
    icon: PlusIcon,
    description: "Start a new fact-check",
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;

  const homeIconRef = useRef<HomeIconHandle>(null);
  const plusIconRef = useRef<PlusIconHandle>(null);

  const iconRefs = [homeIconRef, plusIconRef];

  const handleMenuItemEnter = (index: number) => {
    iconRefs[index]?.current?.startAnimation();
  };

  const handleMenuItemLeave = (index: number) => {
    iconRefs[index]?.current?.stopAnimation();
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div
                  aria-hidden="true"
                  className="size-6 rounded-full border-5 border-black border-dashed"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ClaimeAI</span>
                  <span className="truncate text-xs">AI Fact Checker</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Fact Checking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(({ icon: Icon, ...item }, index) => (
                <SidebarMenuItem
                  key={item.title}
                  onMouseEnter={() => handleMenuItemEnter(index)}
                  onMouseLeave={() => handleMenuItemLeave(index)}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <Icon ref={iconRefs[index]} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="mx-auto max-w-[90%]" />
        <SidebarGroup>
          <SidebarGroupLabel>Learn More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AboutDialog />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <HowItWorksDialog />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="View technical documentation on GitHub"
                >
                  <Link
                    className="flex items-center gap-2"
                    href="https://github.com/BharathxD/claime-ai"
                    target="_blank"
                  >
                    <BookOpen />
                    <span>Documentation</span>
                    <ExternalLink
                      className="ml-auto size-2.5 opacity-70"
                      strokeWidth={1.5}
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AppSidebarFooter />
    </Sidebar>
  );
};
