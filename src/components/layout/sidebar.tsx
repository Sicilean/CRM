"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Package,
  FileText,
  Settings,
  Network,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface SubMenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

// Navigazione area commerciale
const navigation: MenuItem[] = [
  { name: "Dashboard", href: "/commerciale", icon: Home },
  {
    name: "CRM",
    href: "/commerciale/crm",
    icon: Users,
    subItems: [
      { name: "Leads", href: "/commerciale/crm", icon: Target },
      { name: "Opportunità", href: "/commerciale/crm", icon: TrendingUp },
      { name: "Clienti", href: "/commerciale/crm", icon: Users },
    ],
  },
  { name: "Servizi", href: "/servizi", icon: Package },
  { name: "Preventivi", href: "/preventivi", icon: FileText },
  {
    name: "Configurazione",
    href: "/commerciale/services-mapping",
    icon: Settings,
    subItems: [
      {
        name: "Mapping Servizi",
        href: "/commerciale/services-mapping",
        icon: Network,
      },
      {
        name: "Impostazioni Preventivi",
        href: "/commerciale/quote-settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar({ user }: { user: SupabaseUser }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    CRM: true,
    Configurazione: false,
  });

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isMenuActive = (item: MenuItem) => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(
        (sub) => pathname === sub.href || pathname?.startsWith(sub.href + "/")
      );
    }
    return pathname?.startsWith(item.href + "/");
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0 px-4 mb-2 gap-2">
            <Image
              src="/Logo.svg"
              alt="Sicilean Logo"
              width={32}
              height={32}
              unoptimized
              className="flex-shrink-0"
            />
            <Image
              src={
                theme === "dark"
                  ? "/LogoFont_Sicilean_White.svg"
                  : "/LogoFont_Sicilean_Black.svg"
              }
              alt="Sicilean"
              width={120}
              height={27}
              unoptimized
              className="flex-shrink-0"
            />
          </div>

          {/* Badge Area Commerciale */}
          <div className="px-4 mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
              <ShoppingBag className="h-3 w-3" />
              Area Commerciale
            </span>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = isMenuActive(item);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isOpen = openMenus[item.name];

              return (
                <div key={item.name}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={cn(
                          "w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          {item.name}
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {/* Sub Items */}
                      {isOpen &&
                        item.subItems?.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.href ||
                            pathname?.startsWith(subItem.href + "/");
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={cn(
                                "group flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isSubActive
                                  ? "bg-red-600 text-white"
                                  : "text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                              )}
                            >
                              <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-red-600 text-white"
                          : "text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profilo */}
        <div className="flex-shrink-0 border-t p-4 space-y-1">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                CRM & Commerciale
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
