"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Package,
  FileText,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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

// Navigazione area commerciale - Solo sezioni utili per l'agente
const navigation: MenuItem[] = [
  { name: "Dashboard", href: "/commerciale", icon: Home },
  { name: "Trattative", href: "/commerciale/crm", icon: Users },
  { name: "Preventivi", href: "/preventivi", icon: FileText },
  { name: "Servizi", href: "/servizi", icon: Package },
];

interface ProfileData {
  nome: string | null;
  cognome: string | null;
  foto_profilo: string | null;
}

export function Sidebar({ user }: { user: SupabaseUser }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const supabase = createClient();

  // Carica dati profilo
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nome, cognome, foto_profilo")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    };
    loadProfile();
  }, [user.id, supabase]);


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

  const displayName = profile?.nome && profile?.cognome 
    ? `${profile.nome} ${profile.cognome}` 
    : user.email?.split('@')[0] || 'Agente';

  const SidebarContent = () => (
    <>
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
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
                        "w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                              "group flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
      <div className="flex-shrink-0 border-t p-4">
        <Link
          href="/profilo"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            pathname === "/profilo"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          {profile?.foto_profilo ? (
            <Image
              src={profile.foto_profilo}
              alt="Foto profilo"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium truncate",
              pathname === "/profilo" ? "text-primary-foreground" : "text-foreground"
            )}>
              {displayName}
            </p>
            <p className={cn(
              "text-xs truncate",
              pathname === "/profilo" ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              Il mio profilo
            </p>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile since we use bottom nav */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
