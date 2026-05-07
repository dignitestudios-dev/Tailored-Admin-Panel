"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReports, useResolveReport } from "@/lib/api/admin/admin.hooks";
import type { AdminReport, ReportFilterType, ReportStatus } from "@/lib/api/admin/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const toLabel = (value: string) =>
  value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;

const truncateWords = (text: string, maxWords = 10) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
};

const getPartyPrimaryText = (party: AdminReport["reportedBy"]) => {
  if (!party) return "N/A";
  return party.name?.trim() || party.username?.trim() || party.email?.trim() || "Unknown";
};

const getPartySecondaryText = (party: AdminReport["reportedBy"]) => {
  if (!party) return null;
  if (party.email?.trim()) return party.email;
  if (party.username?.trim()) return `@${party.username}`;
  return null;
};

interface ReportsPageProps {
  reportType: ReportFilterType;
  title: string;
  description: string;
}

export function ReportsPage({ reportType, title, description }: ReportsPageProps) {
  const [status, setStatus] = useState<ReportStatus>("pending");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [gotoPageInput, setGotoPageInput] = useState("");
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [reportToResolve, setReportToResolve] = useState<AdminReport | null>(null);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const resolveReportMutation = useResolveReport();

  const { data, isLoading, isFetching, isError, error, refetch } = useReports({
    type: reportType,
    status,
    page,
    limit,
  });

  const reports = data?.items ?? [];
  const pagination = data?.pagination;
  const totalReports = pagination?.totalItems ?? 0;
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

  const handleConfirmResolveReport = async () => {
    if (!reportToResolve) return;

    setResolvingReportId(reportToResolve.id);
    try {
      const response = await resolveReportMutation.mutateAsync(reportToResolve.id);
      toast.success(response.message || "Report resolved successfully.");
      if (selectedReport?.id === reportToResolve.id) {
        setSelectedReport(null);
      }
      setReportToResolve(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resolve report.");
    } finally {
      setResolvingReportId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#006838]/25 bg-[#eef8f2] text-[#006838]">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as ReportStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[150px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolve">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
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
                  Total Reports
                </CardDescription>
                <div className="rounded-full bg-gradient-to-r from-[#006838] to-[#00B562] p-2 text-white">
                  <ShieldAlert className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-3xl">{totalReports}</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-3 w-28" />
          ) : (
            <p className="text-xs text-muted-foreground">{toLabel(status)} reports queue</p>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[380px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported by</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={`reports-skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-44" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-16 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                          <AlertCircle className="size-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Unable to load reports</p>
                        <p className="text-xs text-muted-foreground">
                          {error instanceof Error ? error.message : "Please try again."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !reports.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#eef8f2] text-[#006838]">
                          <SearchX className="size-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">No reports found</p>
                        <p className="text-xs text-muted-foreground">
                          No {status} reports are available right now.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="max-w-[260px] truncate">
                        {report.reason ? truncateWords(report.reason) : "No reason provided"}
                      </TableCell>
                      <TableCell>
                        {report.reportedBy?.id ? (
                          <Link
                            href={`/dashboard/users?userId=${report.reportedBy.id}`}
                            className="block text-[#006838] transition hover:underline"
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {getPartyPrimaryText(report.reportedBy)}
                            </p>
                            {getPartySecondaryText(report.reportedBy) ? (
                              <p className="text-xs text-muted-foreground">
                                {getPartySecondaryText(report.reportedBy)}
                              </p>
                            ) : null}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.type === "user" && report.reported?.id ? (
                          <Link
                            href={`/dashboard/users?userId=${report.reported.id}`}
                            className="block text-[#006838] transition hover:underline"
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {getPartyPrimaryText(report.reported)}
                            </p>
                            {getPartySecondaryText(report.reported) ? (
                              <p className="text-xs text-muted-foreground">
                                {getPartySecondaryText(report.reported)}
                              </p>
                            ) : null}
                          </Link>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {getPartyPrimaryText(report.reported)}
                            </p>
                            {getPartySecondaryText(report.reported) ? (
                              <p className="text-xs text-muted-foreground">
                                {getPartySecondaryText(report.reported)}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            report.status === "resolve"
                              ? "border-[#006838]/30 bg-[#eef8f2] text-[#006838]"
                              : "border-slate-300 bg-slate-100 text-slate-700"
                          }
                        >
                          {report.status === "resolve" ? "Resolved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>{dateFormatter.format(new Date(report.createdAt))}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {report.status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => setReportToResolve(report)}
                              disabled={resolvingReportId === report.id}
                            >
                              {resolvingReportId === report.id ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              ) : null}
                              Mark as Resolved
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                            <Eye className="mr-2 size-4" />
                            View
                          </Button>
                        </div>
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
        <Card className="w-full border py-4 shadow-sm">
          <CardContent className="flex items-center justify-between gap-10">
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

            <div className="flex items-center justify-between gap-5">
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

      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Detail</DialogTitle>
          </DialogHeader>

          {selectedReport ? (
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">{toLabel(selectedReport.type)} Report</p>
                <p className="text-xs text-muted-foreground">
                  Created {dateFormatter.format(new Date(selectedReport.createdAt))}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Target Model</span>
                  <span>{selectedReport.targetModel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Reported By</span>
                  {selectedReport.reportedBy?.id ? (
                    <Link
                      href={`/dashboard/users?userId=${selectedReport.reportedBy.id}`}
                      className="text-right text-[#006838] transition hover:underline"
                    >
                      <p className="text-sm font-medium">{getPartyPrimaryText(selectedReport.reportedBy)}</p>
                      {getPartySecondaryText(selectedReport.reportedBy) ? (
                        <p className="text-xs text-muted-foreground">
                          {getPartySecondaryText(selectedReport.reportedBy)}
                        </p>
                      ) : null}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Reported</span>
                  {selectedReport.type === "user" && selectedReport.reported?.id ? (
                    <Link
                      href={`/dashboard/users?userId=${selectedReport.reported.id}`}
                      className="text-right text-[#006838] transition hover:underline"
                    >
                      <p className="text-sm font-medium">{getPartyPrimaryText(selectedReport.reported)}</p>
                      {getPartySecondaryText(selectedReport.reported) ? (
                        <p className="text-xs text-muted-foreground">
                          {getPartySecondaryText(selectedReport.reported)}
                        </p>
                      ) : null}
                    </Link>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm font-medium">{getPartyPrimaryText(selectedReport.reported)}</p>
                      {getPartySecondaryText(selectedReport.reported) ? (
                        <p className="text-xs text-muted-foreground">
                          {getPartySecondaryText(selectedReport.reported)}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedReport.status === "resolve"
                        ? "border-[#006838]/30 bg-[#eef8f2] text-[#006838]"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                    }
                  >
                    {selectedReport.status === "resolve" ? "Resolved" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Blocked</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedReport.isBlocked
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                    }
                  >
                    {selectedReport.isBlocked ? "Blocked" : "No"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-slate-700">Reason</p>
                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                  {selectedReport.reason || "No reason provided"}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(reportToResolve)}
        onOpenChange={(open) => {
          if (!open && !resolvingReportId) {
            setReportToResolve(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve report?</AlertDialogTitle>
            <AlertDialogDescription>
              {reportToResolve
                ? `Mark report "${reportToResolve.reason || "No reason provided"}" as resolved?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(resolvingReportId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmResolveReport}
              disabled={Boolean(resolvingReportId)}
            >
              {resolvingReportId ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Resolving...
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
