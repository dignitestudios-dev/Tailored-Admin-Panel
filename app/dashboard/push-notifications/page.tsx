"use client";

import { useState } from "react";
import {
  AlertCircle,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  RefreshCw,
  SearchX,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNotifications } from "@/lib/api/admin/admin.hooks";
import type { AdminNotification } from "@/lib/api/admin/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const truncateWords = (text: string, maxWords = 10) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [gotoPageInput, setGotoPageInput] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useNotifications({
    page,
    limit,
  });

  const notifications = data?.items ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? page;

  const handleGoToPage = () => {
    const parsedPage = Number(gotoPageInput);
    if (!Number.isInteger(parsedPage)) return;

    const boundedPage = Math.min(Math.max(parsedPage, 1), totalPages);
    setPage(boundedPage);
    setGotoPageInput("");
  };

  const handleGoToPageInputChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) {
      setGotoPageInput("");
      return;
    }

    const parsedPage = Number(digitsOnly);
    const boundedPage = Math.min(Math.max(parsedPage, 1), totalPages);
    setGotoPageInput(String(boundedPage));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#006838]/25 bg-[#eef8f2] text-[#006838]">
            <BellRing className="size-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Notification</h1>
            <p className="text-sm text-muted-foreground">
              View all broadcast notifications sent from admin panel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/push-notifications/send">
              <Plus className="mr-2 size-4" />
              Send Notification
            </Link>
          </Button>
        </div>
      </div>

      <Card className="max-w-sm border-0 bg-gradient-to-br from-white via-[#f6fbf8] to-[#ecf8f1] shadow-sm">
        <CardHeader className="pb-2">
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="size-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-wide">
                  Total Notifications
                </CardDescription>
                <div className="rounded-full bg-gradient-to-r from-[#006838] to-[#00B562] p-2 text-white">
                  <BellRing className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-3xl">{totalItems}</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-3 w-28" />
          ) : (
            <p className="text-xs text-muted-foreground">All admin broadcast notifications</p>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[380px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={`notifications-skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-64" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-16 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                          <AlertCircle className="size-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          Unable to load notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {error instanceof Error ? error.message : "Please try again."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !notifications.length ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#eef8f2] text-[#006838]">
                          <SearchX className="size-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          No notifications found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Send your first broadcast notification.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {truncateWords(notification.description)}
                      </TableCell>
                      <TableCell>{dateFormatter.format(new Date(notification.sentAt))}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <Eye className="mr-2 size-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Card className="w-full border shadow-sm py-4">
          <CardContent className="flex justify-between items-center gap-10">
            <div className="flex items-center gap-3 md:justify-self-start">
              <p className="text-sm text-muted-foreground">Rows per page</p>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-24 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center gap-5">
              <div className="flex items-center gap-3 md:justify-self-center">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 md:justify-self-end">
                <Input
                  value={gotoPageInput}
                  onChange={(event) => handleGoToPageInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleGoToPage();
                    }
                  }}
                  placeholder="Page"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="h-10 w-24 rounded-xl"
                />
                <Button variant="outline" className="h-10 rounded-xl px-4" onClick={handleGoToPage}>
                  Go
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(selectedNotification)}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Detail</DialogTitle>
          </DialogHeader>

          {selectedNotification ? (
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">{selectedNotification.title}</p>
                <p className="text-xs text-muted-foreground">
                  Sent {dateFormatter.format(new Date(selectedNotification.sentAt))}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">Description</p>
                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                  {selectedNotification.description}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
