import type {
  AdminUserDetail,
  AuditLogEntry,
  DashboardDateRange,
  DashboardOverview,
  GroupChatReport,
  NotificationPayload,
  NotificationRecord,
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

let groupReports: GroupChatReport[] = [
  {
    id: 'gr-001',
    groupName: 'Streetwear Deals',
    reason: 'Spam and misleading links',
    reportedBy: 'avakhan',
    date: daysAgo(1),
    reportCount: 9,
  },
  {
    id: 'gr-002',
    groupName: 'Daily Closet Swaps',
    reason: 'Harassment in chat',
    reportedBy: 'oliviap',
    date: daysAgo(4),
    reportCount: 5,
  },
  {
    id: 'gr-003',
    groupName: 'Vintage Marketplace',
    reason: 'Inappropriate content',
    reportedBy: 'liamg',
    date: daysAgo(6),
    reportCount: 3,
  },
];

let notificationHistory: NotificationRecord[] = [
  {
    id: 'nt-001',
    title: 'Spring Credits Boost',
    message: 'Get bonus coins on your next purchase.',
    sendOption: 'immediate',
    status: 'sent',
    sentAt: daysAgo(1),
  },
];

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
        user: {
          id: purchase.user._id,
          name: purchase.user.name,
          email: purchase.user.email,
          profilePicture: purchase.user.profilePicture,
        },
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

export async function getGroupReports(): Promise<GroupChatReport[]> {
  await delay();
  return clone(groupReports);
}

export async function deleteGroupReport(reportId: string): Promise<void> {
  await delay();
  const existingReport = groupReports.find((report) => report.id === reportId);
  groupReports = groupReports.filter((report) => report.id !== reportId);

  if (existingReport) {
    appendAuditLog('Reported group deleted', existingReport.groupName);
  }
}

export async function suspendUsersFromReportedGroup(reportId: string): Promise<void> {
  await delay();
  const existingReport = groupReports.find((report) => report.id === reportId);

  if (existingReport) {
    appendAuditLog('Users suspended from group report', existingReport.groupName);
  }
}

export async function getNotificationHistory(): Promise<NotificationRecord[]> {
  await delay();
  return clone(notificationHistory);
}

export async function sendPushNotification(
  payload: NotificationPayload
): Promise<NotificationRecord> {
  await delay();

  const isScheduled = payload.sendOption === 'scheduled';
  const sentAt = isScheduled && payload.scheduledFor
    ? new Date(payload.scheduledFor).toISOString()
    : new Date().toISOString();

  const record: NotificationRecord = {
    id: `nt-${Date.now()}`,
    title: payload.title,
    message: payload.message,
    sendOption: payload.sendOption,
    status: isScheduled ? 'scheduled' : 'sent',
    sentAt,
  };

  notificationHistory = [record, ...notificationHistory];
  appendAuditLog(
    isScheduled ? 'Push notification scheduled' : 'Push notification sent',
    payload.title
  );

  return clone(record);
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  await delay();
  return clone(auditLogs);
}
