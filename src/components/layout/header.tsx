"use client"

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ProfileData {
  nome: string | null;
  cognome: string | null;
}

export function Header({ user }: { user: SupabaseUser }) {
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nome, cognome")
        .eq("id", user.id)
        .single()
      if (data) setProfile(data)
    }
    loadProfile()
  }, [user.id, supabase])

  const displayName = profile?.nome && profile?.cognome 
    ? `${profile.nome} ${profile.cognome}` 
    : user.email?.split('@')[0] || 'Agente'

  return (
    <header className="bg-card border-b px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Logo su mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Image
            src="/Logo.svg"
            alt="Sicilean"
            width={28}
            height={28}
            unoptimized
            className="flex-shrink-0"
          />
          <Image
            src="/LogoFont_Sicilean_Black.svg"
            alt="Sicilean"
            width={90}
            height={20}
            unoptimized
            className="flex-shrink-0 dark:hidden"
          />
          <Image
            src="/LogoFont_Sicilean_White.svg"
            alt="Sicilean"
            width={90}
            height={20}
            unoptimized
            className="flex-shrink-0 hidden dark:block"
          />
        </div>
        {/* Benvenuto su desktop */}
        <span className="text-sm text-muted-foreground hidden md:inline">
          Benvenuto, <span className="font-medium text-foreground">{displayName}</span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 md:h-9 md:w-9"
        >
          <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}


