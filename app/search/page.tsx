"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Phone, Bell } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  description: string;
  pharmacies: {
    pharmacyId: string;
    pharmacyName: string;
    location: string;
    price: number;
    quantity: number;
    lastUpdated: string;
  }[];
}

export default function SearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/users/subscriptions");
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("name", searchTerm);
      if (location && location !== "all") params.append("location", location);

      const response = await fetch(`/api/medicines?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.data || []);
        
        if (user) {
          await fetch("/api/users/activity", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "search",
              description: `Searched for "${searchTerm}" ${
                location ? `in ${location}` : ""
              }`,
              metadata: {
                searchTerm,
                location,
                resultsCount: data.data?.length || 0,
              },
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error searching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (medicineId: string, medicineName: string) => {
    try {
      const response = await fetch("/api/users/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineId,
          medicineName,
        }),
      });

      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error("Error subscribing to medicine:", error);
    }
  };

  const isSubscribed = (medicineId: string) => {
    return subscriptions.some((sub: any) => sub.medicineId === medicineId);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />

      <div className="flex-1 p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Search Medicines</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="medicine" className="text-sm font-medium">
                      Medicine Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="medicine"
                        placeholder="e.g., Paracetamol"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="accra">Accra</SelectItem>
                        <SelectItem value="kumasi">Kumasi</SelectItem>
                        <SelectItem value="tamale">Tamale</SelectItem>
                        <SelectItem value="takoradi">Takoradi</SelectItem>
                        <SelectItem value="cape-coast">Cape Coast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">SMS Search</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No internet? Use our SMS service to find medicines.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Send SMS to:</p>
                  <p>+233XXXXXXXX</p>
                  <p className="font-medium mt-2 mb-1">Format:</p>
                  <code>FIND [MEDICINE] [LOCATION]</code>
                  <p className="mt-2 text-xs">
                    Example: FIND PARACETAMOL ACCRA
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">
              {loading
                ? "Searching..."
                : results.length > 0
                ? `Found ${results.length} results`
                : "Search Results"}
            </h2>

            {results.length === 0 && !loading ? (
              <div className="text-center py-12 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No medicines found. Try a different search term."
                    : "Enter a medicine name to search for availability"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((medicine) => (
                  <Card key={medicine._id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 border-b flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {medicine.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {medicine.genericName}
                          </p>
                        </div>

                        {user && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={
                              isSubscribed(medicine._id) ? "bg-primary/10" : ""
                            }
                            onClick={() =>
                              handleSubscribe(medicine._id, medicine.name)
                            }
                            disabled={isSubscribed(medicine._id)}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            {isSubscribed(medicine._id)
                              ? "Subscribed"
                              : "Notify Me"}
                          </Button>
                        )}
                      </div>

                      <div className="divide-y">
                        {medicine.pharmacies && medicine.pharmacies.length > 0 ? (
                          medicine.pharmacies.map((pharmacy) => (
                            <div
                              key={`${medicine._id}-${pharmacy.pharmacyId}`}
                              className="p-4 flex justify-between items-center"
                            >
                              <div>
                                <h4 className="font-medium">
                                  {pharmacy.pharmacyName}
                                </h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {pharmacy.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  GH₵ {pharmacy.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Updated{" "}
                                  {new Date(
                                    pharmacy.lastUpdated
                                  ).toLocaleDateString()}
                                </div>
                                <Link
                                  href={`/report?medicineId=${medicine._id}&name=${medicine.name}&pharmacyId=${pharmacy.pharmacyId}&pharmacy=${pharmacy.pharmacyName}`}
                                  className="text-xs text-primary hover:underline mt-1 inline-block"
                                >
                                  Report Availability
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            Currently out of stock at all pharmacies
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}