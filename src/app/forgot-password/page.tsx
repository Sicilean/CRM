"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Errore durante l'invio dell'email di reset")
        setLoading(false)
      } else {
        setSuccess(true)
        toast({
          title: "Email inviata",
          description: "Controlla la tua casella di posta per le istruzioni di reset password",
        })
      }
    } catch (err) {
      setError("Errore durante l'invio dell'email di reset")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-foreground">
              Email Inviata
            </CardTitle>
            <CardDescription className="text-center">
              Controlla la tua casella di posta per le istruzioni di reset password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Ti abbiamo inviato un&apos;email con un link per reimpostare la tua password.
                Il link scadrà tra 1 ora.
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Torna al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Password Dimenticata</CardTitle>
          <CardDescription className="text-center">
            Inserisci la tua email per ricevere le istruzioni di reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tuonome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Invio in corso..." : "Invia Email di Reset"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-sm"
              >
                Torna al Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
