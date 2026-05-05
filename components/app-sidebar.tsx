"use client";

import * as React from "react";
import {
  BarChart3,
  BellRing,
  ClipboardList,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

import { RootState } from "@/lib/store";
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navGroups: [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          title: "User Management",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Group Chat Reports",
          url: "/dashboard/group-reports",
          icon: ShieldAlert,
        },
        {
          title: "Push Notifications",
          url: "/dashboard/push-notifications",
          icon: BellRing,
        },
        {
          title: "Audit Log",
          url: "/dashboard/audit-log",
          icon: ClipboardList,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: RootState) => state.auth.user);

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: "",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/dashboard"
                className="flex items-center justify-center"
              >
                <Logo size={86} className="text-current" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
