import type {
  AdminStats,
  AlertLog,
  AlertStatus,
  AuditAction,
  AuditLog,
  AuditTargetType,
  Outage,
  OutageStatus,
  OutageType,
  Subscriber,
  User,
} from "@shared/types"

export interface OutageFilters {
  municipality?: string
  barangay?: string
  range?: "day" | "week" | "all"
}

export interface OutageInput {
  title: string
  municipality: string
  barangays: string[]
  sitio_notes: string | null
  type: OutageType
  status: OutageStatus
  date: string
  start_time: string
  end_time: string | null
  reason: string | null
  source: OutageSource
  created_by: string | null
}

export type OutageSource = "manual" | "facebook"

export interface OutageUpdate {
  title?: string
  municipality?: string
  barangays?: string[]
  sitio_notes?: string | null
  type?: OutageType
  status?: OutageStatus
  date?: string
  start_time?: string
  end_time?: string | null
  reason?: string | null
  source?: OutageSource
}

export interface UserInput {
  name: string
  email: string
  password_hash: string
  is_admin: boolean
}

export interface AuditLogInput {
  actor_user_id: string | null
  action: AuditAction
  target_type: AuditTargetType
  target_id?: string | null
  details?: unknown | null
}

export interface SubscriberInput {
  email: string
  barangay: string
  sitio?: string | null
  verify_token?: string | null
}

export interface AlertLogInput {
  outage_id: string
  subscriber_id: string
  status: AlertStatus
  recipient?: string | null
  nota?: string | null
}

export interface DBAdapter {
  readonly name: string

  /* Users */
  getUserByEmail(email: string): Promise<User | null>
  getUserById(id: string): Promise<User | null>
  createUser(input: UserInput): Promise<User>

  /* Outages */
  listOutages(filters?: OutageFilters): Promise<Outage[]>
  getOutageById(id: string): Promise<Outage | null>
  createOutage(input: OutageInput): Promise<Outage>
  updateOutage(id: string, patch: OutageUpdate): Promise<Outage | null>
  deleteOutage(id: string): Promise<boolean>

  /* Stats */
  getOutageStats(): Promise<AdminStats>

  /* Subscribers / alerts */
  createSubscriber(input: SubscriberInput): Promise<Subscriber>
  getSubscriberByEmailBarangay(email: string, barangay: string): Promise<Subscriber | null>
  verifySubscriber(token: string): Promise<Subscriber | null>
  deactivateSubscriber(token: string): Promise<Subscriber | null>
  findSubscribersByBarangay(barangays: string[]): Promise<Subscriber[]>
  listSubscribers(limit?: number): Promise<Subscriber[]>
  recordAlert(input: AlertLogInput): Promise<AlertLog>
  countSubscribers(): Promise<number>
  countAlertLogs(): Promise<number>

  /* Audit */
  createAuditLog(input: AuditLogInput): Promise<AuditLog>
  listAuditLogs(limit?: number): Promise<AuditLog[]>
}