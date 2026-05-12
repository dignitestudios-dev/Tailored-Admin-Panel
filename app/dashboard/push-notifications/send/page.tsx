"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BellRing, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSendPushNotification } from "@/lib/api/admin/admin.hooks";
import type { NotificationPayload } from "@/lib/api/admin/types";

export default function SendNotificationPage() {
  const sendMutation = useSendPushNotification();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const previewPayload = useMemo<NotificationPayload>(
    () => ({
      title: title.trim(),
      description: description.trim(),
    }),
    [title, description]
  );

  const validateForm = () => {
    const nextErrors: { title?: string; description?: string } = {};

    if (!previewPayload.title) {
      nextErrors.title = "Title is required.";
    } else if (previewPayload.title.length > 100) {
      nextErrors.title = "Title must be at most 100 characters.";
    }

    if (!previewPayload.description) {
      nextErrors.description = "Description is required.";
    } else if (previewPayload.description.length > 500) {
      nextErrors.description = "Description must be at most 500 characters.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReview = () => {
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    try {
      await sendMutation.mutateAsync(previewPayload);
      toast.success("Notification broadcast sent successfully.");
      setConfirmOpen(false);
      router.push("/dashboard/push-notifications");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send notification.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#006838]/25 bg-[#eef8f2] text-[#006838]">
            <BellRing className="size-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Send Notification</h1>
            <p className="text-sm text-muted-foreground">
              Broadcast announcements to all users.
            </p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/dashboard/push-notifications">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Compose Notification</CardTitle>
            <CardDescription>Create a broadcast message.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="Enter title here..."
                maxLength={100}
              />
              {fieldErrors.title ? (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">{title.length}/100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-description">Description</Label>
              <Textarea
                id="notification-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder="Write the notification description shown to users..."
                className="h-32 max-h-32 resize-none overflow-y-auto"
                maxLength={500}
              />
              {fieldErrors.description ? (
                <p className="text-xs text-destructive">{fieldErrors.description}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">{description.length}/500</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleReview} disabled={sendMutation.isPending}>
                {sendMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                {sendMutation.isPending ? "Sending..." : "Review and Confirm"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>How users will see this notification.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full max-w-sm rounded-[28px] border border-slate-200 bg-[#f1f5f3] p-3 shadow-inner">
              <div className="rounded-[18px] border bg-white p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#006838] to-[#00B562] text-white">
                    <BellRing className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700">Tailored</p>
                      <p className="text-[11px] text-muted-foreground">now</p>
                    </div>
                    <h3 className="mt-1 truncate text-sm font-semibold">
                      {previewPayload.title || "Notification title"}
                    </h3>
                    <p className="mt-1 max-h-14 overflow-hidden text-xs text-muted-foreground">
                      {previewPayload.description ||
                        "Notification description preview will appear here."}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Mobile app notification preview
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (sendMutation.isPending) return;
          setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm notification</AlertDialogTitle>
            <AlertDialogDescription>
              {`Send "${previewPayload.title}" to all users now?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendMutation.isPending}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
