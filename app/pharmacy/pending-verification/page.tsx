"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/contexts/auth-context";

// Define types for the pharmacy data and user
interface Pharmacy {
  name: string;
  licenseNumber: string;
  location: string;
  region: string;
  contactNumber: string;
  verified: boolean;
  operatingHours: string | null;
  coordinates: string | null;
}

interface User {
  email: string;
  name: string;
  phoneNumber: string | null;
  role: string;
  verified: boolean;
}

export default function PendingVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      return;
    }

    // Fetch pharmacy data
    async function fetchPharmacyData() {
      try {
        const response = await fetch("/api/pharmacy/profile");
        const data = await response.json();

        if (response.ok) {
          setPharmacy(data.pharmacy);

          // If pharmacy is already verified, redirect to dashboard
          if (data.pharmacy.verified) {
            router.push("/pharmacy/dashboard");
          }
        } else if (response.status === 401) {
          // Not logged in
          router.push("/login?redirect=/pharmacy/pending-verification");
        } else {
          setError(data.error || "Failed to fetch pharmacy data");
        }
      } catch (error) {
        console.error("Error fetching pharmacy data:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPharmacyData();
  }, [user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Pharmacy Verification</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Verification Pending</CardTitle>
              <CardDescription>Your pharmacy registration is being reviewed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="h-10 w-10 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium">Thank you for registering your pharmacy</h3>
                  <p className="text-muted-foreground mt-2">
                    Your pharmacy registration is currently pending verification by our team. This process typically
                    takes 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Our team will review your pharmacy details and license information</li>
                  <li>You'll receive an SMS notification when your pharmacy is verified</li>
                  <li>Once verified, you'll have full access to manage your medicine inventory</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">While you wait</h4>
                    <p className="text-green-700 text-sm mt-1">
                      You can explore the platform and familiarize yourself with the features. Once verified, you'll be
                      able to add medicines to your inventory and update their availability.
                    </p>
                  </div>
                </div>
              </div>

              {pharmacy && (
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Pharmacy Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name:</p>
                      <p className="font-medium">{pharmacy.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">License Number:</p>
                      <p className="font-medium">{pharmacy.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location:</p>
                      <p className="font-medium">
                        {pharmacy.location}, {pharmacy.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact:</p>
                      <p className="font-medium">{pharmacy.contactNumber}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@medifindghana.com" className="text-primary hover:underline">
                  support@medifindghana.com
                </a>
              </p>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
