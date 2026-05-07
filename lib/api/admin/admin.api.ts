import type {
  AdminUserDetail,
  AuditLogEntry,
  DashboardDateRange,
  DashboardOverview,
  NotificationListResponse,
  NotificationPayload,
  NotificationQueryParams,
  ReportListResponse,
  ReportQueryParams,
  UserListResponse,
  UserQueryParams,
} from './types';
import { API } from '../axios';

const now = new Date();

const daysAgo = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

let auditLogs: AuditLogEntry[] = [
  {
    id: 'al-001',
    action: 'Admin login',
    actor: 'admin@tailored.com',
    target: 'Admin Console',
    createdAt: daysAgo(0),
  },
  {
    id: 'al-002',
    action: 'User suspended',
    actor: 'admin@tailored.com',
    target: 'sophiaa',
    createdAt: daysAgo(2),
  },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const appendAuditLog = (action: string, target: string) => {
  auditLogs = [
    {
      id: `al-${Date.now()}`,
      action,
      actor: 'admin@tailored.com',
      target,
      createdAt: new Date().toISOString(),
    },
    ...auditLogs,
  ];
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return getDashboardOverviewWithFilters('30d');
}

type DashboardApiResponse = {
  success: boolean;
  message: string;
  data: null;
  filters: {
    dateRange: DashboardDateRange;
    platform: string;
    search: string;
  };
  metrics: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    totalCoinBalance: number;
  };
  recentUsers: Array<{
    _id: string;
    name: string | null;
    email: string;
    profilePicture: string | null;
    coinBalance?: number;
    createdAt: string;
  }>;
  recentPurchases: Array<{
    _id: string;
    user: {
      _id: string;
      name: string | null;
      email: string;
      profilePicture: string | null;
    };
    platform: string;
    planKey: string;
    coinsGranted: number;
    createdAt: string;
  }>;
};

export async function getDashboardOverviewWithFilters(
  dateRange: DashboardDateRange
): Promise<DashboardOverview> {
  const response = await API.get<DashboardApiResponse>('/admin/dashboard', {
    params: {
      dateRange,
    },
  });

  const payload = response.data;
  if (!payload.success) {
    throw new Error(payload.message || 'Unable to fetch dashboard data.');
  }

  return {
    filters: {
      dateRange: payload.filters?.dateRange ?? dateRange,
      platform: payload.filters?.platform ?? 'all',
      search: payload.filters?.search ?? '',
    },
    totalUsers: payload.metrics?.totalUsers ?? 0,
    activeUsers: {
      daily: payload.metrics?.activeUsers?.daily ?? 0,
      weekly: payload.metrics?.activeUsers?.weekly ?? 0,
      monthly: payload.metrics?.activeUsers?.monthly ?? 0,
    },
    totalCurrentCoinCount: payload.metrics?.totalCoinBalance ?? 0,
    recentUsers:
      payload.recentUsers?.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        coinBalance: user.coinBalance ?? 0,
        createdAt: user.createdAt,
      })) ?? [],
    recentCreditPurchases:
      payload.recentPurchases?.map((purchase) => ({
        id: purchase._id,
        user: purchase.user
          ? {
              id: purchase.user._id,
              name: purchase.user.name,
              email: purchase.user.email,
              profilePicture: purchase.user.profilePicture,
            }
          : null,
        platform: purchase.platform,
        planKey: purchase.planKey,
        coinsGranted: purchase.coinsGranted,
        createdAt: purchase.createdAt,
      })) ?? [],
  };
}

export async function getUsers(
  params: UserQueryParams = {}
): Promise<UserListResponse> {
  type UsersApiResponse = {
    success: boolean;
    message: string;
    data: Array<{
      _id: string;
      name: string | null;
      email: string;
      profilePicture: string | null;
      coinBalance?: number;
      isDetailsCompleted: boolean;
      isAvatarConfirmed: boolean;
      isDeactivatedByAdmin?: boolean;
      createdAt: string;
      username?: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };

  const response = await API.get<UsersApiResponse>('/admin/users', {
    params: {
      search: params.search ?? '',
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  const payload = response.data;
  if (!payload.success) {
    throw new Error(payload.message || 'Unable to fetch users.');
  }

  return {
    items: payload.data.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      coinBalance: user.coinBalance ?? 0,
      isDetailsCompleted: user.isDetailsCompleted,
      isAvatarConfirmed: user.isAvatarConfirmed,
      isDeactivatedByAdmin: user.isDeactivatedByAdmin ?? false,
      createdAt: user.createdAt,
      username: user.username ?? null,
    })),
    pagination: payload.pagination,
  };
}

export async function getUserById(userId: string): Promise<AdminUserDetail> {
  type UserDetailApiResponse = {
    success: boolean;
    message: string;
    data: null;
    _id: string;
    name: string | null;
    email: string;
    profilePicture: string | null;
    phone: string | null;
    country: string | null;
    city: string | null;
    isDetailsCompleted: boolean;
    isAvatarConfirmed: boolean;
    isDeactivatedByAdmin?: boolean;
    isSocialLogin: boolean;
    createdAt: string;
    username?: string;
    coinBalance?: number;
  };

  const response = await API.get<UserDetailApiResponse>(`/admin/users/${userId}`);
  const payload = response.data;

  if (!payload.success) {
    throw new Error(payload.message || 'Unable to fetch user details.');
  }

  return {
    id: payload._id,
    name: payload.name,
    email: payload.email,
    profilePicture: payload.profilePicture,
    phone: payload.phone,
    country: payload.country,
    city: payload.city,
    isDetailsCompleted: payload.isDetailsCompleted,
    isAvatarConfirmed: payload.isAvatarConfirmed,
    isDeactivatedByAdmin: payload.isDeactivatedByAdmin ?? false,
    isSocialLogin: payload.isSocialLogin,
    createdAt: payload.createdAt,
    username: payload.username ?? null,
    coinBalance: payload.coinBalance ?? 0,
  };
}

export async function updateUserStatus(userId: string, deactivate: boolean) {
  type UserStatusApiResponse = {
    success: boolean;
    message: string;
    data: {
      _id: string;
      name: string | null;
      email: string;
      isDeactivatedByAdmin: boolean;
    };
  };

  const response = await API.patch<UserStatusApiResponse>(
    `/admin/users/${userId}/status`,
    {
      deactivate,
    }
  );

  const payload = response.data;
  if (!payload.success) {
    throw new Error(payload.message || 'Unable to update user status.');
  }

  return payload;
}

export async function getReports(params: ReportQueryParams): Promise<ReportListResponse> {
  type ReportsApiResponse = {
    success: boolean;
    message: string;
    data: Array<{
      _id: string;
      targetModel: 'ChatRoom' | 'Message' | 'Post' | 'Comments' | 'User' | 'Circle';
      type: 'chatroom' | 'message' | 'post' | 'comment' | 'user' | 'circle';
      reportedBy: {
        _id: string;
        name: string | null;
        email?: string;
        profilePicture?: string | null;
        username?: string;
      } | null;
      reported: {
        _id: string;
        name: string | null;
        email?: string;
        profilePicture?: string | null;
        username?: string;
      } | null;
      action: 'pending' | 'accept' | 'reject';
      createdAt: string;
      updatedAt: string;
      isBlocked: boolean;
      isReported: boolean;
      reason: string | null;
      status: 'pending' | 'resolve';
    }>;
    pagination: {
      itemsPerPage: number;
      currentPage: number;
      totalItems: number;
      totalPages: number;
    };
  };

  const response = await API.get<ReportsApiResponse>('/admin/reports', {
    params: {
      type: params.type,
      status: params.status,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
  });
  const payload = response.data;

  if (!payload.success) {
    throw new Error(payload.message || 'Unable to fetch reports.');
  }

  return {
    items: payload.data.map((report) => ({
      id: report._id,
      targetModel: report.targetModel,
      type: report.type,
      reportedBy: report.reportedBy
        ? {
            id: report.reportedBy._id,
            name: report.reportedBy.name,
            email: report.reportedBy.email ?? null,
            profilePicture: report.reportedBy.profilePicture ?? null,
            username: report.reportedBy.username ?? null,
          }
        : null,
      reported: report.reported
        ? {
            id: report.reported._id,
            name: report.reported.name,
            email: report.reported.email ?? null,
            profilePicture: report.reported.profilePicture ?? null,
            username: report.reported.username ?? null,
          }
        : null,
      reason: report.reason,
      status: report.status,
      isBlocked: report.isBlocked,
      isReported: report.isReported,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    })),
    pagination: {
      itemsPerPage: payload.pagination?.itemsPerPage ?? (params.limit ?? 10),
      currentPage: payload.pagination?.currentPage ?? (params.page ?? 1),
      totalItems: payload.pagination?.totalItems ?? 0,
      totalPages: payload.pagination?.totalPages ?? 1,
    },
  };
}

export async function resolveReport(reportId: string): Promise<{ message: string }> {
  type ResolveReportApiResponse = {
    success: boolean;
    message: string;
    data?: unknown;
  };

  const response = await API.patch<ResolveReportApiResponse>(
    `/admin/reports/${reportId}/resolve`,
    {}
  );
  const payload = response.data;

  if (!payload.success) {
    throw new Error(payload.message || 'Unable to resolve report.');
  }

  return { message: payload.message };
}

export async function getNotifications(
  params: NotificationQueryParams = {}
): Promise<NotificationListResponse> {
  type NotificationsApiResponse = {
    success: boolean;
    message: string;
    data: Array<{
      _id: string;
      notificationContent: {
        _id: string;
        title: string;
        description: string;
      };
      isRead: boolean;
      forAdmin: boolean;
      createdAt: string;
    }>;
    pagination: {
      itemsPerPage: number;
      currentPage: number;
      totalItems: number;
      totalPages: number;
    };
  };

  const response = await API.get<NotificationsApiResponse>('/admin/notifications', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  const payload = response.data;
  if (!payload.success) {
    throw new Error(payload.message || 'Unable to fetch notifications.');
  }

  return {
    items: (payload.data ?? []).map((notification) => ({
      id: notification._id,
      title: notification.notificationContent?.title ?? 'Untitled',
      description: notification.notificationContent?.description ?? '',
      isRead: notification.isRead,
      forAdmin: notification.forAdmin,
      sentAt: notification.createdAt,
    })),
    pagination: {
      itemsPerPage: payload.pagination?.itemsPerPage ?? (params.limit ?? 20),
      currentPage: payload.pagination?.currentPage ?? (params.page ?? 1),
      totalItems: payload.pagination?.totalItems ?? 0,
      totalPages: payload.pagination?.totalPages ?? 1,
    },
  };
}

export async function sendPushNotification(
  payload: NotificationPayload
): Promise<{ message: string }> {
  type BroadcastApiResponse = {
    success: boolean;
    message: string;
    data: null;
  };

  const response = await API.post<BroadcastApiResponse>(
    '/admin/notifications/broadcast',
    {
      title: payload.title,
      description: payload.description,
    }
  );

  const responsePayload = response.data;
  if (!responsePayload.success) {
    throw new Error(responsePayload.message || 'Unable to broadcast notification.');
  }

  appendAuditLog('Broadcast notification sent', payload.title);

  return { message: responsePayload.message };
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  await delay();
  return clone(auditLogs);
}
