
import { LayoutDashboard, Trophy, Activity, User, Gift, PlusSquare, Megaphone } from "lucide-react";
import type { NavigationItem } from "@/components/navigation/types";

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Activities",
    href: "/activities",
    icon: Activity,
  },
  {
    name: "Prizes",
    href: "/prizes",
    icon: Gift,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export const adminNavigationItems: NavigationItem[] = [
  {
    name: "Manage Prizes",
    href: "/admin/prizes",
    icon: Gift,
  },
  {
    name: "Adjust Points",
    href: "/admin/points",
    icon: PlusSquare,
  },
  {
    name: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
  },
];
