"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe, Laptop, Smartphone, Tablet, Trash2 } from "lucide-react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Session {
  _id: string;
  device: string;
  ip: string;
  lastActive: string;
  current: boolean;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  os: string;
  browser: string;
  token: string;
  userId: string;
}

interface FetchSessionsResponse {
  sessions: Session[];
  error?: string;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [terminating, setTerminating] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions");
      const data: FetchSessionsResponse = await response.json();

      if (response.ok) {
        setSessions(data.sessions || []);
      } else {
        setError(data.error || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Session terminated successfully");
        fetchSessions(); // Refresh sessions
      } else {
        const data = await response.json();
        setError(data.error || "Failed to terminate session");
      }
    } catch (error) {
      console.error("Error terminating session:", error);
      setError("An unexpected error occurred");
    } finally {
      setTerminating(false);
      setOpen(null);
    }
  };

  const terminateAllOtherSessions = async () => {
    setTerminating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/auth/sessions`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Terminated ${data.terminatedCount} other sessions`);
        fetchSessions(); // Refresh sessions
      } else {
        const data = await response.json();
        setError(data.error || "Failed to terminate sessions");
      }
    } catch (error) {
      console.error("Error terminating sessions:", error);
      setError("An unexpected error occurred");
    } finally {
      setTerminating(false);
    }
  };

  const getDeviceIcon = (session: Session) => {
    if (session.device.includes("Desktop"))
      return <Laptop className="h-4 w-4 mr-2" />;
    if (session.device.includes("Tablet"))
      return <Tablet className="h-4 w-4 mr-2" />;
    if (session.device.includes("Phone"))
      return <Smartphone className="h-4 w-4 mr-2" />;
    return <Globe className="h-4 w-4 mr-2" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>View and manage your active sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active sessions
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Browser</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session._id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getDeviceIcon(session)}
                      {session.device}
                      {session.current && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{session.ip}</TableCell>
                  <TableCell>{session.os}</TableCell>
                  <TableCell>{session.browser}</TableCell>
                  <TableCell>{formatDate(session.lastActive)}</TableCell>
                  <TableCell className="text-right">
                    {!session.current && (
                      <Dialog
                        open={open === session._id}
                        onOpenChange={() =>
                          setOpen(open === session._id ? null : session._id)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSessionId(session._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Terminate
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                              This will terminate the session on{" "}
                              {session.device} from {session.ip}.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="secondary"
                              onClick={() => setOpen(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={terminating}
                              onClick={() => terminateSession(session._id)}
                            >
                              {terminating ? "Terminating..." : "Terminate"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {sessions.length > 0 && (
          <Button
            variant="destructive"
            className="mt-4"
            onClick={terminateAllOtherSessions}
            disabled={terminating}
          >
            {terminating
              ? "Terminating All..."
              : "Terminate All Other Sessions"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
