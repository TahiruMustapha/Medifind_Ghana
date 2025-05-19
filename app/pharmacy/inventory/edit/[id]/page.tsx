"use client";

import { useState, useEffect, FormEvent, ChangeEvent, use } from "react";
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
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ArrowLeft, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
interface EditMedicinePageProps {
  params: Promise< {
    id: string;
  }>;
}
type InputChangeType = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
export default function EditMedicinePage({ params }: EditMedicinePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    price: "",
    quantity: "",
    lowStockThreshold: "",
    inStock: true,
    notes: "",
  });

  useEffect(() => {
    fetchMedicineData();
  }, [id]);

  const fetchMedicineData = async () => {
    try {
      const response = await fetch(`/api/pharmacy/inventory/${id}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.medicine.name || "",
          genericName: data.medicine.genericName || "",
          price: data.medicine.price?.toString() || "",
          quantity: data.medicine.quantity?.toString() || "",
          lowStockThreshold: data.medicine.lowStockThreshold?.toString() || "5",
          inStock: data.medicine.inStock || false,
          notes: data.medicine.notes || "",
        });
      } else {
        setError(data.error || "Failed to fetch medicine data");
      }
    } catch (error) {
      console.error("Error fetching medicine data:", error);
      setError("An error occurred while fetching medicine data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: InputChangeType) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
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
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/pharmacy/inventory/${id}`, {
        method: "PUT",
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
        setError(data.error || "Failed to update medicine");
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      setError("An error occurred while updating the medicine");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/pharmacy/inventory/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/pharmacy/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete medicine");
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      setError("An error occurred while deleting the medicine");
      setDeleteDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col p-4 md:p-8">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center py-12">Loading medicine data...</div>
        </div>
      </main>
    );
  }

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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Medicine</h1>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Medicine</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this medicine from your
                  inventory? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? "Removing..." : "Remove Medicine"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{formData.name}</CardTitle>
            <CardDescription>
              Update medicine information and inventory status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medicine Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genericName">Generic Name</Label>
                    <Input
                      id="genericName"
                      name="genericName"
                      value={formData.genericName}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="flex items-center space-x-2 h-full pt-8">
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("inStock", checked)
                      }
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Internal)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              <CardFooter className="px-0 pt-4">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
