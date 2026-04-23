// ─── Enum types ───────────────────────────────────────────────────────────────
export type UserRole = 'resident' | 'board' | 'admin'
export type ThreadCategory =
  | 'announcements'
  | 'general'
  | 'events'
  | 'safety'
  | 'maintenance'
  | 'classifieds'
export type DocumentCategory =
  | 'budgets'
  | 'reports'
  | 'audits'
  | 'tax'
  | 'assessments'
  | 'reserves'
export type DocumentStatus = 'new' | 'updated' | null
export type MeetingStatus = 'upcoming' | 'past'
export type StatusLevel = 'ok' | 'warn' | 'alert'
export type StatusCategory = 'facilities' | 'infrastructure'
export type ProjectStatus = 'active' | 'planned' | 'completed'

// ─── Row types ────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  full_name: string
  property_address: string | null
  role: UserRole
  approved: boolean
  created_at: string
}

export interface Thread {
  id: string
  title: string
  body: string
  category: ThreadCategory
  author_id: string | null
  pinned: boolean
  locked: boolean
  view_count: number
  created_at: string
  author?: User | null
  post_count?: number
}

export interface Post {
  id: string
  thread_id: string
  author_id: string | null
  body: string
  like_count: number
  created_at: string
  author?: User | null
}

export interface Document {
  id: string
  name: string
  category: DocumentCategory
  year: number
  file_path: string
  file_size: number
  status: DocumentStatus
  uploaded_by: string | null
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  time: string
  location: string
  status: MeetingStatus
  created_at: string
  attachments?: MeetingAttachment[]
  rsvp_count?: number
  user_rsvped?: boolean
}

export interface MeetingAttachment {
  id: string
  meeting_id: string
  label: string
  file_path: string
  created_at: string
}

export interface StatusItem {
  id: string
  name: string
  category: StatusCategory
  status: StatusLevel
  description: string
  icon: string
  updated_by: string | null
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  progress: number
  budget: number | null
  status: ProjectStatus
  created_at: string
}

export interface IssueReport {
  id: string
  body: string
  submitted_by: string | null
  created_at: string
  resolved: boolean
}

export interface Correspondence {
  id: string
  subject: string
  body: string
  sent_by: string | null
  created_at: string
  sender?: User | null
}

// ─── Supabase Database type (simplified, used for type inference) ─────────────
export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> }
      threads: { Row: Thread; Insert: Partial<Thread>; Update: Partial<Thread> }
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post> }
      documents: { Row: Document; Insert: Partial<Document>; Update: Partial<Document> }
      meetings: { Row: Meeting; Insert: Partial<Meeting>; Update: Partial<Meeting> }
      meeting_attachments: { Row: MeetingAttachment; Insert: Partial<MeetingAttachment>; Update: Partial<MeetingAttachment> }
      meeting_rsvps: { Row: { id: string; meeting_id: string; user_id: string; created_at: string }; Insert: Partial<{ meeting_id: string; user_id: string }>; Update: never }
      status_items: { Row: StatusItem; Insert: Partial<StatusItem>; Update: Partial<StatusItem> }
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> }
      issue_reports: { Row: IssueReport; Insert: Partial<IssueReport>; Update: Partial<IssueReport> }
      correspondence: { Row: Correspondence; Insert: Partial<Correspondence>; Update: Partial<Correspondence> }
    }
    Functions: {
      is_board_or_admin: { Returns: boolean }
      is_approved: { Returns: boolean }
    }
  }
}
