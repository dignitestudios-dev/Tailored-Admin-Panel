"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  RefreshCw,
  Search,
  SearchX,
  UserX,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useToggleUserActivation,
  useUserDetail,
  useUsers,
} from "@/lib/api/admin/admin.hooks";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

const getInitials = (label: string) =>
  label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

function ProfileCircle({
  imageUrl,
  label,
}: {
  imageUrl: string | null;
  label: string;
}) {
  return (
    <div
      className="relative size-9 shrink-0 rounded-full border border-white/70 bg-slate-200 bg-cover bg-center bg-no-repeat"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-600">
          {getInitials(label)}
        </div>
      )}
    </div>
  );
}

function StatusToggle({
  active,
  loading,
  onToggle,
}: {
  active: boolean;
  loading?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex min-w-36 items-center justify-between rounded-full border px-3 py-1 text-sm font-medium transition ${
        active
          ? "border-[#006838]/45 bg-[#eef8f2] text-[#006838]"
          : "border-slate-300 bg-slate-100 text-slate-600"
      } ${loading ? "opacity-60" : ""}`}
    >
      <span>{active ? "Active" : "Suspended"}</span>
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          active
            ? "bg-gradient-to-r from-[#006838] to-[#00B562]"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white transition ${
            active ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [gotoPageInput, setGotoPageInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const activeUserId = selectedUserId ?? queryUserId;

  const { data, isLoading, isFetching, refetch } = useUsers({
    search: debouncedSearch,
    page,
    limit,
  });

  const {
    data: detailUser,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useUserDetail(activeUserId ?? "");
  const toggleActivationMutation = useToggleUserActivation();

  const rows = useMemo(() => data?.items ?? [], [data]);
  const pagination = data?.pagination;
  const totalUsers = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const handleExport = () => {
    if (!rows.length) return;

    const headers = [
      "Name",
      "Email",
      "Username",
      "Registered",
      "Coin Balance",
      "Details Completed",
      "Avatar Confirmed",
      "Status",
    ];

    const body = rows.map((user) => [
      user.name ?? "Unnamed User",
      user.email,
      user.username ?? "-",
      user.createdAt,
      String(user.coinBalance),
      user.isDetailsCompleted ? "Yes" : "No",
      user.isAvatarConfirmed ? "Yes" : "No",
      user.isDeactivatedByAdmin ? "Suspended" : "Active",
    ]);

    const csv = [headers, ...body]
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tailored-users-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleStatus = async (
    userId: string,
    isDeactivatedByAdmin?: boolean,
  ) => {
    setUpdatingUserId(userId);
    try {
      const deactivate = !Boolean(isDeactivatedByAdmin);
      const response = await toggleActivationMutation.mutateAsync({
        userId,
        deactivate,
      });
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Status update failed.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openUserDetail = (userId: string) => {
    setSelectedUserId(userId);
  };

  const closeUserDetail = () => {
    setSelectedUserId(null);
    if (queryUserId) {
      router.replace("/dashboard/users");
    }
  };

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
            <Users className="size-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all user accounts from one place.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
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
                  Total Users
                </CardDescription>
                <div className="rounded-full bg-gradient-to-r from-[#006838] to-[#00B562] p-2 text-white">
                  <Users className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-3xl">{totalUsers}</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-3 w-28" />
          ) : (
            <p className="text-xs text-muted-foreground">
              All registered accounts
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Manage users with quick search, status toggle, and export.
          </p>

          <div className="flex items-center gap-2">
            <div className="relative w-[380px] max-w-[75vw]">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-9"
                placeholder="Search by name, email, or username"
              />
              {searchInput.trim() ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-slate-700"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Export"
              onClick={handleExport}
            >
              <Download className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[380px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={`users-skeleton-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-9 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-44" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-36 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-16 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : rows.length ? (
                  rows.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProfileCircle
                            imageUrl={user.profilePicture}
                            label={user.name ?? user.email}
                          />
                          <span className="font-medium">
                            {user.name ?? "Unnamed User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${user.email}`}
                          className="text-[#006838] transition hover:underline"
                        >
                          {user.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {user.username ? (
                          <span className="font-mono text-xs text-slate-700">
                            @{user.username}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusToggle
                          active={!user.isDeactivatedByAdmin}
                          loading={updatingUserId === user.id}
                          onToggle={() =>
                            void handleToggleStatus(
                              user.id,
                              user.isDeactivatedByAdmin,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {dateFormatter.format(new Date(user.createdAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUserDetail(user.id)}
                        >
                          <Eye className="mr-2 size-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#eef8f2] text-[#006838]">
                          <SearchX className="size-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          No users found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try a different keyword or clear search.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div>
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
                  Page {pagination?.page ?? page} of {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl"
                  disabled={!pagination || pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl"
                  disabled={!pagination || pagination.page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 md:justify-self-end">
                <Input
                  value={gotoPageInput}
                  onChange={(event) =>
                    handleGoToPageInputChange(event.target.value)
                  }
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
                <Button
                  variant="outline"
                  className="h-10 rounded-xl px-4"
                  onClick={handleGoToPage}
                >
                  Go
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(activeUserId)}
        onOpenChange={(open) => !open && closeUserDetail()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Detail</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`detail-skeleton-${index}`}
                  className="flex items-center justify-between"
                >
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ))}
            </div>
          ) : isDetailError || !detailUser ? (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#eef8f2] text-[#006838]">
                <UserX className="size-4" />
              </div>
              <p className="text-sm font-medium text-slate-900">
                User details not found
              </p>
              <p className="text-xs text-muted-foreground">
                This user may no longer be available.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <ProfileCircle
                  imageUrl={detailUser.profilePicture}
                  label={detailUser.name ?? detailUser.email}
                />
                <div>
                  <p className="font-medium">
                    {detailUser.name ?? "Unnamed User"}
                  </p>
                  <a
                    href={`mailto:${detailUser.email}`}
                    className="text-muted-foreground transition hover:text-[#006838] hover:underline"
                  >
                    {detailUser.email}
                  </a>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Username</span>
                  {detailUser.username ? (
                    <span className="font-mono text-xs text-slate-700">
                      @{detailUser.username}
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Phone</span>
                  {detailUser.phone ? (
                    <a
                      href={`tel:${detailUser.phone}`}
                      className="text-slate-700 transition hover:text-[#006838] hover:underline"
                    >
                      {detailUser.phone}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">
                    Country / City
                  </span>
                  <span>
                    {detailUser.country ?? "-"} / {detailUser.city ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Details</span>
                  <Badge
                    variant="outline"
                    className={
                      detailUser.isDetailsCompleted
                        ? "border-[#006838]/30 bg-[#eef8f2] text-[#006838]"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                    }
                  >
                    {detailUser.isDetailsCompleted ? "Completed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Avatar</span>
                  <Badge
                    variant="outline"
                    className={
                      detailUser.isAvatarConfirmed
                        ? "border-[#006838]/30 bg-[#eef8f2] text-[#006838]"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                    }
                  >
                    {detailUser.isAvatarConfirmed ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">
                    Social Login
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      detailUser.isSocialLogin
                        ? "border-[#006838]/30 bg-[#eef8f2] text-[#006838]"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                    }
                  >
                    {detailUser.isSocialLogin ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Registered</span>
                  <span>
                    {dateFormatter.format(new Date(detailUser.createdAt))}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-700">Status</span>
                  <StatusToggle
                    active={!detailUser.isDeactivatedByAdmin}
                    loading={updatingUserId === detailUser.id}
                    onToggle={() =>
                      void handleToggleStatus(
                        detailUser.id,
                        detailUser.isDeactivatedByAdmin,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
