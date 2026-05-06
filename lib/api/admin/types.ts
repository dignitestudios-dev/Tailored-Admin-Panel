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

export type ReportType =
  | 'chatroom'
  | 'message'
  | 'post'
  | 'comment'
  | 'user'
  | 'circle';

export type ReportTargetModel =
  | 'ChatRoom'
  | 'Message'
  | 'Post'
  | 'Comments'
  | 'User'
  | 'Circle';

export type ReportStatus = 'pending' | 'resolve';

export interface ReportQueryParams {
  status: ReportStatus;
  page?: number;
  limit?: number;
}

export interface AdminReport {
  id: string;
  type: ReportType;
  targetModel: ReportTargetModel;
  reportedBy: string;
  reported: string;
  reason: string | null;
  status: ReportStatus;
  isBlocked: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPagination {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ReportListResponse {
  items: AdminReport[];
  pagination: ReportPagination;
}

export interface NotificationPayload {
  title: string;
  description: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
  forAdmin: boolean;
  sentAt: string;
}

export interface NotificationPagination {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface NotificationListResponse {
  items: AdminNotification[];
  pagination: NotificationPagination;
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
