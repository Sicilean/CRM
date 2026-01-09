"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { Mail, Lock, LogIn, Loader2, ShoppingBag, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message === "Invalid login credentials") {
        setError("Credenziali non valide. Controlla email e password.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      router.push("/commerciale")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Pannello sinistro - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo.svg"
              alt="Sicilean Logo"
              width={48}
              height={48}
              unoptimized
              className="drop-shadow-lg"
            />
            <Image
              src="/LogoFont_Sicilean_White.svg"
              alt="Sicilean"
              width={160}
              height={36}
              unoptimized
              className="drop-shadow-lg"
            />
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm">
            <ShoppingBag className="h-4 w-4" />
            Area Commerciale
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Gestisci i tuoi
            <br />
            <span className="text-slate-300">clienti e preventivi</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md">
            La piattaforma dedicata agli Agenti Commerciali Sicilean per gestire lead, opportunità e preventivi.
          </p>
        </div>
        
        <div className="relative z-10 text-slate-400 text-sm">
          © {new Date().getFullYear()} Sicilean. Tutti i diritti riservati.
        </div>
      </div>

      {/* Pannello destro - Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Image
              src="/Logo.svg"
              alt="Sicilean Logo"
              width={40}
              height={40}
              unoptimized
            />
            <Image
              src="/LogoFont_Sicilean_Black.svg"
              alt="Sicilean"
              width={130}
              height={30}
              unoptimized
              className="dark:hidden"
            />
            <Image
              src="/LogoFont_Sicilean_White.svg"
              alt="Sicilean"
              width={130}
              height={30}
              unoptimized
              className="hidden dark:block"
            />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center pb-2">
              <h2 className="text-2xl font-bold">Bentornato</h2>
              <CardDescription>
                Accedi al tuo account commerciale
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tuonome@sicilean.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Accedi
                    </>
                  )}
                </Button>
                
                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => router.push("/forgot-password")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Password dimenticata?
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Info mobile */}
          <div className="lg:hidden mt-6 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Area Commerciale Sicilean
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


