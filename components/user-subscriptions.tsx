"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, Trash2 } from "lucide-react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UserSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/users/subscriptions")
      const data = await response.json()

      if (response.ok) {
        setSubscriptions(data.subscriptions || [])
      } else {
        setError(data.error || "Failed to fetch subscriptions")
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNotification = async (subscriptionId, enabled) => {
    try {
      const response = await fetch(`/api/users/subscriptions/${subscriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        // Update local state
        setSubscriptions(subscriptions.map((sub) => (sub._id === subscriptionId ? { ...sub, enabled } : sub)))
        setSuccess("Notification preference updated")

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update notification preference")
      }
    } catch (error) {
      console.error("Error updating subscription:", error)
      setError("An unexpected error occurred")
    }
  }

  const handleDeleteSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/users/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove from local state
        setSubscriptions(subscriptions.filter((sub) => sub._id !== subscriptionId))
        setSuccess("Subscription removed successfully")

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to remove subscription")
      }
    } catch (error) {
      console.error("Error deleting subscription:", error)
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Medicine Subscriptions</CardTitle>
          <CardDescription>Manage your medicine availability notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>You don't have any medicine subscriptions yet</p>
              <p className="text-sm mt-2">
                When you search for medicines, you can subscribe to get notified when they become available
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription._id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h3 className="font-medium">{subscription.medicineName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.enabled ? (
                        <span className="flex items-center text-green-600">
                          <Bell className="h-3 w-3 mr-1" />
                          Notifications enabled
                        </span>
                      ) : (
                        <span className="flex items-center text-muted-foreground">
                          <BellOff className="h-3 w-3 mr-1" />
                          Notifications disabled
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`notify-${subscription._id}`}
                        checked={subscription.enabled}
                        onCheckedChange={(checked) => handleToggleNotification(subscription._id, checked)}
                      />
                      <Label htmlFor={`notify-${subscription._id}`} className="sr-only">
                        Notifications
                      </Label>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubscription(subscription._id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
