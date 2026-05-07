export type UserRole = 'admin' | 'member';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  task_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  project_id: string;
  assigned_to: string | null;
  created_by: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  project?: Project;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: 'task' | 'project' | 'member';
  entity_id: string;
  entity_name: string;
  created_at: string;
  profile?: Profile;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}
