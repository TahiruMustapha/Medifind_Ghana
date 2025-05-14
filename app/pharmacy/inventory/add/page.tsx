"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function AddMedicinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    lowStockThreshold: "5",
    inStock: true,
    notes: "",
  });
  type InputChangeType = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  const handleChange = (e: InputChangeType) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pharmacy/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number.parseFloat(formData.price) : null,
          quantity: formData.quantity ? Number.parseInt(formData.quantity) : 0,
          lowStockThreshold: formData.lowStockThreshold
            ? Number.parseInt(formData.lowStockThreshold)
            : 5,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/pharmacy/dashboard");
      } else {
        setError(data.error || "Failed to add medicine");
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      setError("An error occurred while adding the medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/pharmacy/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Add Medicine to Inventory</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Medicine Information</CardTitle>
            <CardDescription>
              Add a new medicine to your pharmacy's inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medicine Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genericName">Generic Name *</Label>
                    <Input
                      id="genericName"
                      name="genericName"
                      value={formData.genericName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="antibiotics">Antibiotics</SelectItem>
                        <SelectItem value="analgesics">
                          Analgesics (Pain Relievers)
                        </SelectItem>
                        <SelectItem value="antimalaria">
                          Antimalarials
                        </SelectItem>
                        <SelectItem value="antihypertensives">
                          Antihypertensives
                        </SelectItem>
                        <SelectItem value="antidiabetics">
                          Antidiabetics
                        </SelectItem>
                        <SelectItem value="antihistamines">
                          Antihistamines
                        </SelectItem>
                        <SelectItem value="vitamins">
                          Vitamins & Supplements
                        </SelectItem>
                        <SelectItem value="gastrointestinal">
                          Gastrointestinal
                        </SelectItem>
                        <SelectItem value="respiratory">Respiratory</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (GH₵)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">
                      Low Stock Threshold
                    </Label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      min="1"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("inStock", checked)
                    }
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Internal)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
              </div>

              <CardFooter className="px-0 pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding Medicine..." : "Add Medicine to Inventory"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
