"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: {
    open: string;
    close: string;
  };
  servicePricing: {
    consultation: number;
    prescription_review: number;
    health_screening: number;
    vaccination: number;
    medication_counseling: number;
    other: number;
  };
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    pharmacy: "",
    appointmentDate: "",
    appointmentTime: "",
    service: "",
    description: "",
    patientName: "",
    patientPhone: "",
    patientAge: "",
    urgency: "medium",
    notes: "",
    email: "",
  });

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await fetch("/api/pharmacies?verified=true");
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data.pharmacies || []);
      }
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getConsultationFee = () => {
    const selectedPharmacy = pharmacies.find(
      (p) => p._id === formData.pharmacy
    );
    if (!selectedPharmacy || !formData.service) return 0;
    return (
      selectedPharmacy.servicePricing[
        formData.service as keyof typeof selectedPharmacy.servicePricing
      ] || 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const consultationFee = getConsultationFee();

      // Create appointment first
      const appointmentResponse = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          consultationFee,
          paymentRequired: consultationFee > 0,
        }),
      });

      const appointmentData = await appointmentResponse.json();
      const { appointmentId } = appointmentData;
      if (!appointmentResponse.ok) {
        setError(appointmentData.error || "Failed to book appointment");
        return;
      }
      // console.log("Apointment Data", appointmentData);
      // If payment is required, initialize payment
      if (consultationFee > 0) {
        const paymentResponse = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId: appointmentId,
            email: formData.email,
          }),
        });

        const paymentData = await paymentResponse.json();

        if (paymentResponse.ok) {
          // Redirect to Paystack payment page
          window.location.href = paymentData.data.authorization_url;
        } else {
          setError(paymentData.error || "Failed to initialize payment");
        }
      } else {
        // No payment required, show success message
        setSuccess(
          "Appointment booked successfully! You will receive a confirmation SMS shortly."
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (error) {
      setError("An error occurred while booking the appointment");
    } finally {
      setLoading(false);
    }
  };

  const selectedPharmacy = pharmacies.find((p) => p._id === formData.pharmacy);
  const consultationFee = getConsultationFee();

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Book an Appointment
            </CardTitle>
            <p className="text-gray-600">
              Schedule a consultation with a qualified pharmacist
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pharmacy Selection */}
              <div>
                <Label htmlFor="pharmacy">Select Pharmacy *</Label>
                <Select
                  value={formData.pharmacy}
                  onValueChange={(value) =>
                    handleInputChange("pharmacy", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pharmacy" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacies.map((pharmacy) => (
                      <SelectItem key={pharmacy._id} value={pharmacy._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{pharmacy.name}</span>
                          <span className="text-sm text-gray-500">
                            {pharmacy.address}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPharmacy && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{selectedPharmacy.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {selectedPharmacy.address}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{selectedPharmacy.phone}</span>
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentDate">Appointment Date *</Label>
                  <Input
                    type="date"
                    id="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      handleInputChange("appointmentDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentTime">Preferred Time *</Label>
                  <Select
                    value={formData.appointmentTime}
                    onValueChange={(value) =>
                      handleInputChange("appointmentTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service Type */}
              <div>
                <Label htmlFor="service">Service Type *</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => handleInputChange("service", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className=" bg-red-500">
                    <SelectItem value="consultation">
                      General Consultation
                    </SelectItem>
                    <SelectItem value="prescription_review">
                      Prescription Review
                    </SelectItem>
                    <SelectItem value="health_screening">
                      Health Screening
                    </SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="medication_counseling">
                      Medication Counseling
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Consultation Fee Display */}
              {consultationFee > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Consultation Fee
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    GHS {consultationFee.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Payment will be processed securely via Paystack
                  </p>
                </div>
              )}

              {consultationFee === 0 && formData.service && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Free Consultation
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    No payment required for this service
                  </p>
                </div>
              )}

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-white">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      type="text"
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) =>
                        handleInputChange("patientName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientAge">Patient Age *</Label>
                    <Input
                      type="number"
                      id="patientAge"
                      value={formData.patientAge}
                      onChange={(e) =>
                        handleInputChange("patientAge", e.target.value)
                      }
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientPhone">Contact Phone *</Label>
                    <Input
                      type="tel"
                      id="patientPhone"
                      value={formData.patientPhone}
                      onChange={(e) =>
                        handleInputChange("patientPhone", e.target.value)
                      }
                      placeholder="+233 XX XXX XXXX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description and Urgency */}
              <div>
                <Label htmlFor="description">Reason for Appointment *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Please describe your health concern or reason for the appointment..."
                  rows={3}
                  maxLength={500}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange("urgency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Low - Routine consultation
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Moderate concern
                    </SelectItem>
                    <SelectItem value="high">
                      High - Urgent attention needed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional information you'd like to share..."
                  rows={2}
                  maxLength={1000}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Appointments are subject to pharmacy availability</li>
                      <li>You will receive SMS confirmation within 24 hours</li>
                      <li>
                        For emergencies, please visit the nearest hospital
                      </li>
                      {consultationFee > 0 && (
                        <li>Payment is processed securely through Paystack</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={
                  loading ||
                  !formData.pharmacy ||
                  !formData.appointmentDate ||
                  !formData.appointmentTime ||
                  !formData.service ||
                  !formData.patientName ||
                  !formData.patientPhone ||
                  !formData.patientAge ||
                  !formData.email ||
                  !formData.description
                }
              >
                {loading ? (
                  "Processing..."
                ) : consultationFee > 0 ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay GHS {consultationFee.toFixed(2)} & Book Appointment
                  </>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
