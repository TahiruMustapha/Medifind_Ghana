"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";

interface Pharmacy {
  _id: string;
  name: string;
  verified: boolean;
  // Add other pharmacy properties as needed
}

interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  price?: number;
  quantity?: number;
  inStock: boolean;
  lowStockThreshold?: number;
  // Add other medicine properties as needed
}

interface Stats {
  totalMedicines: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  searchCount: number;
}

export default function PharmacyDashboard() {
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalMedicines: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    searchCount: 0,
  });

  useEffect(() => {
    fetchPharmacyData();
    fetchMedicineInventory();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const response = await fetch("/api/pharmacy/profile");
      const data = await response.json();

      if (response.ok) {
        setPharmacy(data.pharmacy);
      } else if (response.status === 401) {
        router.push("/login?redirect=/pharmacy/dashboard");
      } else if (response.status === 404) {
        router.push("/pharmacy/register");
      }
    } catch (error) {
      console.error("Error fetching pharmacy data:", error);
    }
  };

  const fetchMedicineInventory = async () => {
    try {
      const response = await fetch("/api/pharmacy/inventory");
      const data = await response.json();

      if (response.ok) {
        const inventory = data.inventory || [];
        setMedicines(inventory);

        const inStock = inventory.filter(
          (item: Medicine) => item.inStock
        ).length;
        const lowStock = inventory.filter(
          (item: Medicine) =>
            item.inStock &&
            item.quantity &&
            item.lowStockThreshold &&
            item.quantity <= item.lowStockThreshold
        ).length;

        setStats({
          totalMedicines: inventory.length,
          inStock,
          outOfStock: inventory.length - inStock,
          lowStock,
          searchCount: data.searchCount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching medicine inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      {/* <NavBar /> */}
      <div className="max-w-7xl mt-4 mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Dashboard</h1>
            {pharmacy && (
              <p className="text-muted-foreground">
                {pharmacy.name} •{" "}
                {pharmacy.verified ? "Verified" : "Pending Verification"}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Link href="/pharmacy/inventory/add">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </Link>
            <Link href="/pharmacy/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>

        {pharmacy && !pharmacy.verified && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800">
                    Verification Pending
                  </h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    Your pharmacy is currently pending verification. Some
                    features may be limited until verification is complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Medicines
                  </p>
                  <p className="text-3xl font-bold">{stats.totalMedicines}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Stock
                  </p>
                  <p className="text-3xl font-bold">{stats.inStock}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Out of Stock
                  </p>
                  <p className="text-3xl font-bold">{stats.outOfStock}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Search Count
                  </p>
                  <p className="text-3xl font-bold">{stats.searchCount}</p>
                </div>
                <Search className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Inventory</CardTitle>
                <CardDescription>
                  Manage your medicine inventory and update availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading inventory...</div>
                ) : medicines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No medicines in your inventory yet</p>
                    <Link href="/pharmacy/inventory/add">
                      <Button variant="outline" className="mt-4">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Medicine
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium text-sm">
                      <div className="col-span-5">Medicine</div>
                      <div className="col-span-2">Price</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-1"></div>
                    </div>

                    {medicines.map((medicine) => (
                      <div
                        key={medicine._id}
                        className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center"
                      >
                        <div className="col-span-5">
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {medicine.genericName}
                          </p>
                        </div>
                        <div className="col-span-2">
                          {medicine.price
                            ? `GH₵ ${medicine.price.toFixed(2)}`
                            : "-"}
                        </div>
                        <div className="col-span-2">
                          {medicine.quantity || "-"}
                        </div>
                        <div className="col-span-2">
                          {medicine.inStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <div className="col-span-1 text-right">
                          <Link
                            href={`/pharmacy/inventory/edit/${medicine._id}`}
                          >
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>
                  Medicines that are running low and need to be restocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading data...</div>
                ) : medicines.filter(
                    (m) =>
                      m.inStock &&
                      m.quantity &&
                      m.lowStockThreshold &&
                      m.quantity <= m.lowStockThreshold
                  ).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30 text-green-500" />
                    <p>No medicines are currently low in stock</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium text-sm">
                      <div className="col-span-5">Medicine</div>
                      <div className="col-span-2">Current</div>
                      <div className="col-span-2">Threshold</div>
                      <div className="col-span-3"></div>
                    </div>

                    {medicines
                      .filter(
                        (m) =>
                          m.inStock &&
                          m.quantity &&
                          m.lowStockThreshold &&
                          m.quantity <= m.lowStockThreshold
                      )
                      .map((medicine) => (
                        <div
                          key={medicine._id}
                          className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center"
                        >
                          <div className="col-span-5">
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {medicine.genericName}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-amber-600">
                              {medicine.quantity}
                            </span>
                          </div>
                          <div className="col-span-2">
                            {medicine.lowStockThreshold}
                          </div>
                          <div className="col-span-3 text-right">
                            <Link
                              href={`/pharmacy/inventory/edit/${medicine._id}`}
                            >
                              <Button variant="outline" size="sm">
                                Update Stock
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Search Analytics</CardTitle>
                <CardDescription>
                  See which medicines are most searched for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Analytics will be available soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
