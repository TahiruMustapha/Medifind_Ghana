"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        credentials: "include", // Crucial for cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Shorter delay for better UX
        setTimeout(() => router.push("/dashboard"), 1000)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || "Failed to resend verification code")
      }
    } catch (error) {
      console.error("Error resending code:", error)
      setError("An unexpected error occurred")
    } finally {
      setResending(false)
    }
  }

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/login")
    }
  }, [email, router])

  if (!email) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">MediFind Ghana</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Account verified! Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Account</CardTitle>
            <CardDescription>
              Enter the verification code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  className="text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  title="Please enter a 6-digit code"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Didn't receive a code?{" "}
              <button 
                onClick={handleResendCode} 
                className="text-primary hover:underline" 
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </div>

            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}