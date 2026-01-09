"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Package,
  FileText,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Home", href: "/commerciale", icon: Home },
  { name: "CRM", href: "/commerciale/crm", icon: Users },
  { name: "Preventivi", href: "/preventivi", icon: FileText },
  { name: "Servizi", href: "/servizi", icon: Package },
  { name: "Profilo", href: "/profilo", icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/commerciale") {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[56px] rounded-lg transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                  active ? "bg-primary text-primary-foreground" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-tight",
                active ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
