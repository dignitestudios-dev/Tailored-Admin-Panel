'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteGroupReport,
  getAuditLogs,
  getDashboardOverviewWithFilters,
  getGroupReports,
  getNotificationHistory,
  getUserById,
  getUsers,
  sendPushNotification,
  suspendUsersFromReportedGroup,
  updateUserStatus,
} from './admin.api';
import type {
  DashboardDateRange,
  NotificationPayload,
  UserQueryParams,
} from './types';

const adminQueryKeys = {
  dashboard: (dateRange: DashboardDateRange) =>
    ['admin', 'dashboard', dateRange] as const,
  users: (params: UserQueryParams) => ['admin', 'users', params] as const,
  user: (userId: string) => ['admin', 'user', userId] as const,
  groupReports: ['admin', 'group-reports'] as const,
  notifications: ['admin', 'notifications'] as const,
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

export function useGroupReports() {
  return useQuery({
    queryKey: adminQueryKeys.groupReports,
    queryFn: getGroupReports,
    refetchInterval: 30_000,
  });
}

export function useNotificationHistory() {
  return useQuery({
    queryKey: adminQueryKeys.notifications,
    queryFn: getNotificationHistory,
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: adminQueryKeys.auditLogs,
    queryFn: getAuditLogs,
    refetchInterval: 30_000,
  });
}

export function useDeleteGroupReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteGroupReport(reportId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.groupReports });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
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

export function useSuspendGroupUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => suspendUsersFromReportedGroup(reportId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.groupReports });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}

export function useSendPushNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationPayload) => sendPushNotification(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}
