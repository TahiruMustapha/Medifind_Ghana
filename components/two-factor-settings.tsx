"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, ShieldCheck, ShieldOff, Smartphone } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export function TwoFactorSettings() {
  const { getTwoFactorStatus, enableTwoFactor } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  useEffect(() => {
    fetchTwoFactorStatus()
  }, [])

  const fetchTwoFactorStatus = async () => {
    try {
      const { enabled, phoneNumber, error } = await getTwoFactorStatus()

      if (error) {
        setError(error)
      } else {
        setTwoFactorEnabled(enabled)
        setPhoneNumber(phoneNumber)
      }
    } catch (error) {
      console.error("Error fetching 2FA status:", error)
      setError("Failed to fetch two-factor authentication status")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTwoFactor = async (enabled: boolean) => {
    setUpdating(true)
    setError("")
    setSuccess("")

    try {
      const { success, error } = await enableTwoFactor(enabled)

      if (success) {
        setTwoFactorEnabled(enabled)
        setSuccess(`Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`)
      } else {
        setError(error || "Failed to update two-factor authentication settings")
      }
    } catch (error) {
      console.error("Error updating 2FA settings:", error)
      setError("An unexpected error occurred")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div>Loading two-factor authentication settings...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by requiring a verification code when you log in
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!phoneNumber && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Phone Number Required</AlertTitle>
            <AlertDescription>
              You need to add a phone number to your profile before you can enable two-factor authentication.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <div className="text-sm text-muted-foreground">Receive a verification code via SMS or Email when you log in</div>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={handleToggleTwoFactor}
              disabled={updating || !phoneNumber}
            />
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-start gap-4">
              {twoFactorEnabled ? (
                <ShieldCheck className="h-6 w-6 text-green-500 mt-1" />
              ) : (
                <ShieldOff className="h-6 w-6 text-muted-foreground mt-1" />
              )}
              <div>
                <h3 className="font-medium">
                  {twoFactorEnabled ? "Two-factor authentication is enabled" : "Two-factor authentication is disabled"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {twoFactorEnabled
                    ? "When you log in, you'll need to provide a verification code sent to your phone."
                    : "Enable two-factor authentication for added security."}
                </p>

                {phoneNumber &&  (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Smartphone className="h-4 w-4 mr-1" />
                    Verification codes will be sent to: {phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
