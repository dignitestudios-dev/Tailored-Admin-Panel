"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Coins,
  RefreshCw,
  ShoppingCart,
  UserPlus,
  UserCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/lib/api/admin/admin.hooks";
import type { DashboardDateRange } from "@/lib/api/admin/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const rowBackgrounds = ["bg-[#edf4ef]", "bg-[#f3f7f4]", "bg-[#eaf1ec]"];
const listCardHeight = "h-[430px]";

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
      className="relative size-10 shrink-0 rounded-full border border-white/70 bg-slate-200 bg-cover bg-center bg-no-repeat"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-600">
          {getInitials(label)}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DashboardDateRange>("30d");
  const { data, isLoading, isFetching, isError, error, refetch } =
    useDashboardOverview(dateRange);
  const isDashboardLoading = isLoading || !data;

  const metricCards = data
    ? [
        {
          title: "Total Users",
          value: data.totalUsers.toLocaleString(),
          icon: Users,
          note: "All registered accounts",
        },
        {
          title: "Daily Active Users",
          value: data.activeUsers.daily.toLocaleString(),
          icon: UserCheck,
          note: "Last 24 hours",
        },
        {
          title: "Weekly Active Users",
          value: data.activeUsers.weekly.toLocaleString(),
          icon: UserCheck,
          note: "Last 7 days",
        },
        {
          title: "Monthly Active Users",
          value: data.activeUsers.monthly.toLocaleString(),
          icon: UserCheck,
          note: "Last 30 days",
        },
        {
          title: "Total Coin Balance",
          value: data.totalCurrentCoinCount.toLocaleString(),
          icon: Coins,
          note: "Current coins in system",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-[#006838] to-[#00B562] text-white shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Dashboard Overview</CardTitle>
              <CardDescription className="text-emerald-50/90">
                Live admin insights powered by the dashboard API.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={dateRange}
                onValueChange={(value) =>
                  setDateRange(value as DashboardDateRange)
                }
              >
                <SelectTrigger className="w-28 border-white/30 bg-white/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-white/30 bg-white/15 text-white hover:bg-white/20"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {data?.filters && (
            <div className="text-xs text-emerald-50/90">
              Active filter: {data.filters.dateRange} • Platform:{" "}
              {data.filters.platform}
            </div>
          )}
        </CardHeader>
      </Card>

      {isError ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-6">
            <p className="text-sm text-rose-700">
              {error instanceof Error
                ? error.message
                : "Unable to fetch dashboard data."}
            </p>
            <Button className="mt-4" onClick={() => void refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {isDashboardLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Card
                    key={`metric-skeleton-${index}`}
                    className="border-0 bg-gradient-to-br from-white via-[#f6fbf8] to-[#ecf8f1] shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="size-8 rounded-full" />
                      </div>
                      <Skeleton className="mt-1 h-8 w-20" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Skeleton className="h-3 w-28" />
                    </CardContent>
                  </Card>
                ))
              : metricCards.map((card) => (
                  <Card
                    key={card.title}
                    className="border-0 bg-gradient-to-br from-white via-[#f6fbf8] to-[#ecf8f1] shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-xs uppercase tracking-wide">
                          {card.title}
                        </CardDescription>
                        <div className="rounded-full bg-gradient-to-r from-[#006838] to-[#00B562] p-2 text-white">
                          <card.icon className="size-3.5" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl">{card.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">
                        {card.note}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="overflow-hidden pt-0">
              <div className="border-b bg-[#edf4ef] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#006838] to-[#00B562] text-white shadow-sm">
                      <UserPlus className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recently Registered Users
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Latest user signups from platform records.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#006838]/25 bg-[#006838]/10 px-3 py-1 text-xs font-medium text-[#006838]">
                    {isDashboardLoading
                      ? "..."
                      : `${data.recentUsers.length} users`}
                  </span>
                </div>
              </div>
              <CardContent
                className={`${listCardHeight} space-y-3 overflow-y-auto pr-2`}
              >
                {isDashboardLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`recent-users-skeleton-${index}`}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 ${rowBackgrounds[index % rowBackgrounds.length]}`}
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-36" />
                          </div>
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="ml-auto h-3 w-16" />
                          <Skeleton className="ml-auto h-3 w-20" />
                        </div>
                      </div>
                    ))
                  : data.recentUsers.map((user, index) => (
                      <Link
                        key={user.id}
                        href={`/dashboard/users?userId=${user.id}`}
                        className="block"
                      >
                        <div
                          className={`flex items-center justify-between rounded-xl px-4 py-3 transition hover:brightness-[0.98] ${rowBackgrounds[index % rowBackgrounds.length]}`}
                        >
                          <div className="flex items-center gap-3">
                            <ProfileCircle
                              imageUrl={user.profilePicture}
                              label={user.name ?? user.email}
                            />
                            <div>
                              <p className="font-medium text-slate-800">
                                {user.name ?? "Unnamed User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-[#006838]">
                              {user.coinBalance.toLocaleString()} coins
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dateFormatter.format(new Date(user.createdAt))}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden pt-0">
              <div className="border-b bg-[#edf4ef] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#006838] to-[#00B562] text-white shadow-sm">
                      <ShoppingCart className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recent Purchases
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Latest coin purchase activity.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#006838]/25 bg-[#006838]/10 px-3 py-1 text-xs font-medium text-[#006838]">
                    {isDashboardLoading
                      ? "..."
                      : `${data.recentCreditPurchases.length} purchases`}
                  </span>
                </div>
              </div>
              <CardContent
                className={`${listCardHeight} space-y-3 overflow-y-auto pr-2`}
              >
                {isDashboardLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`recent-purchase-skeleton-${index}`}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 ${rowBackgrounds[index % rowBackgrounds.length]}`}
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="ml-auto h-4 w-14" />
                          <Skeleton className="ml-auto h-3 w-20" />
                        </div>
                      </div>
                    ))
                  : data.recentCreditPurchases.map((purchase, index) => (
                      <Link
                        key={purchase.id}
                        href={`/dashboard/users?userId=${purchase.user.id}`}
                        className="block"
                      >
                        <div
                          className={`flex items-center justify-between rounded-xl px-4 py-3 transition hover:brightness-[0.98] ${rowBackgrounds[index % rowBackgrounds.length]}`}
                        >
                          <div className="flex items-center gap-3">
                            <ProfileCircle
                              imageUrl={purchase.user.profilePicture}
                              label={purchase.user.name ?? purchase.user.email}
                            />
                            <div>
                              <p className="font-medium text-slate-800">
                                {purchase.user.name ?? "Unnamed User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {purchase.user.email}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {purchase.platform} • {purchase.planKey}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="bg-gradient-to-r from-[#006838] to-[#00B562] bg-clip-text text-lg font-semibold text-transparent">
                              +{purchase.coinsGranted.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dateFormatter.format(
                                new Date(purchase.createdAt),
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
