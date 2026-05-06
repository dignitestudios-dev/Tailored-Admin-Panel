'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAuditLogs,
  getDashboardOverviewWithFilters,
  getNotifications,
  getReports,
  getUserById,
  resolveReport,
  getUsers,
  sendPushNotification,
  updateUserStatus,
} from './admin.api';
import type {
  DashboardDateRange,
  NotificationPayload,
  NotificationQueryParams,
  ReportQueryParams,
  UserQueryParams,
} from './types';

const adminQueryKeys = {
  dashboard: (dateRange: DashboardDateRange) =>
    ['admin', 'dashboard', dateRange] as const,
  users: (params: UserQueryParams) => ['admin', 'users', params] as const,
  user: (userId: string) => ['admin', 'user', userId] as const,
  reports: (params: ReportQueryParams) => ['admin', 'reports', params] as const,
  notifications: (params: NotificationQueryParams) => ['admin', 'notifications', params] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
};

export function useDashboardOverview(dateRange: DashboardDateRange) {
  return useQuery({
    queryKey: adminQueryKeys.dashboard(dateRange),
    queryFn: () => getDashboardOverviewWithFilters(dateRange),
    refetchInterval: 30_000,
  });
}

export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => getUsers(params),
    refetchInterval: 30_000,
  });
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: adminQueryKeys.user(userId),
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
  });
}

export function useReports(params: ReportQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.reports(params),
    queryFn: () => getReports(params),
    refetchInterval: 30_000,
  });
}

export function useNotifications(params: NotificationQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.notifications(params),
    queryFn: () => getNotifications(params),
    refetchInterval: 30_000,
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: adminQueryKeys.auditLogs,
    queryFn: getAuditLogs,
    refetchInterval: 30_000,
  });
}

export function useToggleUserActivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      deactivate,
    }: {
      userId: string;
      deactivate: boolean;
    }) => updateUserStatus(userId, deactivate),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.user(variables.userId),
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useSendPushNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationPayload) => sendPushNotification(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => resolveReport(reportId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}
