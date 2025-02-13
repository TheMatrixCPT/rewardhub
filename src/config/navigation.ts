
import { LayoutDashboard, Trophy, Activity, User, Gift, PlusSquare } from "lucide-react";
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
  {
    name: "Manage Prizes",
    href: "/admin/prizes",
    icon: Gift,
    adminOnly: true,
  },
  {
    name: "Adjust Points",
    href: "/admin/points",
    icon: PlusSquare,
    adminOnly: true,
  },
];
