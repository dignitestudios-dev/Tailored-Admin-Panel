export type UserStatus = 'active' | 'suspended';

export interface AdminUserSummary {
  id: string;
  name: string | null;
  email: string;
  profilePicture: string | null;
  coinBalance: number;
  isDetailsCompleted: boolean;
  isAvatarConfirmed: boolean;
  createdAt: string;
  username?: string | null;
  isDeactivatedByAdmin?: boolean;
}

export interface AdminUserDetail extends AdminUserSummary {
  phone: string | null;
  country: string | null;
  city: string | null;
  isSocialLogin: boolean;
}

export interface CreditPurchaseActivity {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    profilePicture: string | null;
  };
  platform: string;
  planKey: string;
  coinsGranted: number;
  createdAt: string;
}

export interface DashboardRecentUser {
  id: string;
  name: string | null;
  email: string;
  profilePicture: string | null;
  coinBalance: number;
  createdAt: string;
}

export type DashboardDateRange = '24h' | '7d' | '30d';

export interface DashboardFilters {
  dateRange: DashboardDateRange;
  platform: string;
  search: string;
}

export interface DashboardOverview {
  filters: DashboardFilters;
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  totalCurrentCoinCount: number;
  recentUsers: DashboardRecentUser[];
  recentCreditPurchases: CreditPurchaseActivity[];
}

export interface GroupChatReport {
  id: string;
  groupName: string;
  reason: string;
  reportedBy: string;
  date: string;
  reportCount: number;
}

export interface NotificationPayload {
  title: string;
  message: string;
  sendOption: 'immediate' | 'scheduled';
  scheduledFor?: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  sendOption: 'immediate' | 'scheduled';
  status: 'sent' | 'scheduled';
  sentAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  createdAt: string;
}

export interface UserQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListResponse {
  items: AdminUserSummary[];
  pagination: UserPagination;
}
