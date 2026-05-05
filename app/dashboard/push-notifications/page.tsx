"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNotificationHistory, useSendPushNotification } from "@/lib/api/admin/admin.hooks";
import type { NotificationPayload } from "@/lib/api/admin/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function PushNotificationsPage() {
  const { data: history, isLoading } = useNotificationHistory();
  const sendMutation = useSendPushNotification();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendOption, setSendOption] = useState<"immediate" | "scheduled">(
    "immediate"
  );
  const [scheduledFor, setScheduledFor] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const previewPayload = useMemo<NotificationPayload>(
    () => ({
      title: title.trim(),
      message: message.trim(),
      sendOption,
      scheduledFor: sendOption === "scheduled" ? scheduledFor : undefined,
    }),
    [title, message, sendOption, scheduledFor]
  );

  const validateForm = () => {
    if (!previewPayload.title || !previewPayload.message) {
      toast.error("Title and message are required.");
      return false;
    }

    if (previewPayload.sendOption === "scheduled" && !previewPayload.scheduledFor) {
      toast.error("Choose a schedule time before confirming.");
      return false;
    }

    return true;
  };

  const handleReview = () => {
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    await sendMutation.mutateAsync(previewPayload);
    toast.success(
      previewPayload.sendOption === "scheduled"
        ? "Notification scheduled successfully."
        : "Notification sent successfully."
    );

    setTitle("");
    setMessage("");
    setSendOption("immediate");
    setScheduledFor("");
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="brand-gradient-border">
        <CardHeader>
          <CardTitle className="brand-gradient-text">Push Notifications</CardTitle>
          <CardDescription>
            Compose, preview, and schedule notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Promotion update"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-option">Send option</Label>
              <Select
                value={sendOption}
                onValueChange={(value) =>
                  setSendOption(value as "immediate" | "scheduled")
                }
              >
                <SelectTrigger id="send-option">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Send immediately</SelectItem>
                  <SelectItem value="scheduled">Schedule later</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-message">Message</Label>
            <Textarea
              id="notification-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write the message shown to users..."
              className="min-h-28"
            />
          </div>

          {sendOption === "scheduled" && (
            <div className="space-y-2">
              <Label htmlFor="scheduled-for">Schedule time</Label>
              <Input
                id="scheduled-for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
              />
            </div>
          )}

          <div className="rounded-lg border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preview
            </p>
            <h3 className="mt-2 text-base font-semibold">
              {previewPayload.title || "Notification title"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {previewPayload.message || "Notification message preview will appear here."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Send mode:{" "}
              {previewPayload.sendOption === "scheduled"
                ? `Scheduled (${previewPayload.scheduledFor || "time not selected"})`
                : "Immediate"}
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleReview}>Review and Confirm</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification history</CardTitle>
          <CardDescription>Recently sent or scheduled pushes.</CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg border p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading notification history...
                  </TableCell>
                </TableRow>
              ) : !history?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No notifications yet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.message}</TableCell>
                    <TableCell className="capitalize">{item.sendOption}</TableCell>
                    <TableCell className="capitalize">{item.status}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(item.sentAt))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm notification</AlertDialogTitle>
            <AlertDialogDescription>
              {previewPayload.sendOption === "scheduled"
                ? `Schedule "${previewPayload.title}" for ${previewPayload.scheduledFor}?`
                : `Send "${previewPayload.title}" now?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
