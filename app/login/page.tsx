"use client"

import { ChangeEvent, FormEvent, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setRequiresVerification(false)
    setRequiresTwoFactor(false)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
console.log("Data from backend after login!",data)
      if (response.ok) {
        if (data.requiresTwoFactor) {
          // Redirect to 2FA page
          setRequiresTwoFactor(true)
          setVerificationEmail(data.email)
        } else {
          router.push(redirect)
        }
      } else if (response.status === 403 && data.requiresVerification) {
        // Account requires verification
        setRequiresVerification(true)
        setVerificationEmail(data.email)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = () => {
    router.push(`/verify?email=${verificationEmail}`)
  }

  const handleTwoFactor = () => {
    router.push(`/two-factor?email=${verificationEmail}&redirect=${redirect}`)
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

        {requiresVerification && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Account Not Verified</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Your account has not been verified yet. Please verify your account to continue.</p>
              <Button
                variant="outline"
                className="bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
                onClick={handleVerify}
              >
                Verify Account
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {requiresTwoFactor && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Two-Factor Authentication Required</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Please enter the verification code sent to your phone to complete login.</p>
              <Button
                variant="outline"
                className="bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200 hover:text-blue-900"
                onClick={handleTwoFactor}
              >
                Enter Verification Code
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>

            <div className="text-sm text-center text-muted-foreground">
              Are you a pharmacy?{" "}
              <Link href="/pharmacy/register" className="text-primary hover:underline">
                Register your pharmacy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
