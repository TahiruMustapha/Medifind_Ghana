"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Appointment {
  _id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  description: string;
  urgency: string;
  status: string;
  notes?: string;
  pharmacistNotes?: string;
  createdAt: string;
}

export default function PharmacyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(
    null
  );
  const [pharmacistNotes, setPharmacistNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/pharmacy/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        setError("Failed to fetch appointments");
      }
    } catch (error) {
      setError("An error occurred while fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string
  ) => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/pharmacy/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            pharmacistNotes:
              selectedAppointment === appointmentId
                ? pharmacistNotes
                : undefined,
          }),
        }
      );

      if (response.ok) {
        await fetchAppointments();
        setSelectedAppointment(null);
        setPharmacistNotes("");
      } else {
        setError("Failed to update appointment");
      }
    } catch (error) {
      setError("An error occurred while updating appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointment Management
          </h1>
          <p className="text-gray-600">
            Manage your pharmacy appointments and consultations
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments yet
              </h3>
              <p className="text-gray-600">
                Appointments will appear here when patients book consultations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <Card key={appointment._id} className="overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <User className="h-5 w-5 text-blue-600" />
                        {appointment.patientName}
                        <Badge className={getUrgencyColor(appointment.urgency)}>
                          {appointment.urgency} priority
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.appointmentTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {appointment.patientPhone}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Appointment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-900">
                          <span className="font-medium ">Service:</span>{" "}
                          {appointment.service.replace("_", " ")}
                        </div>
                        <div className="text-gray-900">
                          <span className="font-medium">Patient Age:</span>{" "}
                          {appointment.patientAge} years
                        </div>
                        <div className="text-gray-900">
                          <span className="font-medium">Booked:</span>{" "}
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 text-gray-900 ">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Reason for Visit
                        </h5>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {appointment.description}
                        </p>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 ">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Patient Notes
                          </h5>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      {appointment.status === "pending" && (
                        <div className="space-y-4">
                          <div>
                            <Label
                              className="text-gray-900"
                              htmlFor={`notes-${appointment._id}`}
                            >
                              Pharmacist Notes (Optional)
                            </Label>
                            <Textarea
                              id={`notes-${appointment._id}`}
                              value={
                                selectedAppointment === appointment._id
                                  ? pharmacistNotes
                                  : ""
                              }
                              onChange={(e) => {
                                setSelectedAppointment(appointment._id);
                                setPharmacistNotes(e.target.value);
                              }}
                              placeholder="Add any notes about this appointment..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "confirmed"
                                )
                              }
                              disabled={actionLoading}
                              className="flex-1 text-gray-900 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-700" />
                              Confirm
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "cancelled"
                                )
                              }
                              disabled={actionLoading}
                              className="flex-1 text-gray-900 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {appointment.status === "confirmed" && (
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor={`completion-notes-${appointment._id}`}
                            >
                              Consultation Notes
                            </Label>
                            <Textarea
                              id={`completion-notes-${appointment._id}`}
                              value={
                                selectedAppointment === appointment._id
                                  ? pharmacistNotes
                                  : ""
                              }
                              onChange={(e) => {
                                setSelectedAppointment(appointment._id);
                                setPharmacistNotes(e.target.value);
                              }}
                              placeholder="Add consultation notes and recommendations..."
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment._id,
                                "completed"
                              )
                            }
                            disabled={actionLoading}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-gray-900" />
                            Mark as Completed
                          </Button>
                        </div>
                      )}

                      {appointment.pharmacistNotes && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Pharmacist Notes
                          </h5>
                          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                            {appointment.pharmacistNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
