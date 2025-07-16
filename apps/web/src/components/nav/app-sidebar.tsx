"use client";

import { BookOpen, ExternalLink, Home, Plus } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";
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
    icon: Home,
    description: "Main fact-checking interface",
  },
  {
    title: "New Check",
    url: "/?clear=true",
    icon: Plus,
    description: "Start a new fact-check",
  },
];

export const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div
                  className="size-6 rounded-full border-5 border-black border-dashed"
                  aria-hidden="true"
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
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.description}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="max-w-[90%] mx-auto" />
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
                  tooltip="View technical documentation on GitHub"
                  asChild
                >
                  <Link
                    className="flex items-center gap-2"
                    href="https://github.com/BharathxD/claime-ai"
                    target="_blank"
                  >
                    <BookOpen />
                    <span>Documentation</span>
                    <ExternalLink
                      className="ml-auto opacity-70 size-2.5"
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
