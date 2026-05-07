import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats, Task, ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      setLoading(true);
      const now = new Date().toISOString();

      if (profile.role === 'admin') {
        const [projects, tasks, activity] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact' }),
          supabase.from('tasks').select('*, assignee:profiles!tasks_assigned_to_fkey(*), project:projects(*)'),
          supabase.from('activity_logs').select('*, profile:profiles(*)').order('created_at', { ascending: false }).limit(10),
        ]);
        const allTasks: Task[] = tasks.data || [];
        setStats({
          totalProjects: projects.count || 0,
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.status === 'completed').length,
          pendingTasks: allTasks.filter(t => t.status !== 'completed').length,
          overdueTasks: allTasks.filter(t => t.due_date && t.due_date < now && t.status !== 'completed').length,
        });
        setRecentTasks(allTasks.slice(0, 5));
        setRecentActivity(activity.data || []);
      } else {
        const [memberOf, tasks, activity] = await Promise.all([
          supabase.from('project_members').select('project_id').eq('user_id', profile.id),
          supabase.from('tasks').select('*, assignee:profiles!tasks_assigned_to_fkey(*), project:projects(*)').eq('assigned_to', profile.id),
          supabase.from('activity_logs').select('*, profile:profiles(*)').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10),
        ]);
        const myTasks: Task[] = tasks.data || [];
        setStats({
          totalProjects: (memberOf.data || []).length,
          totalTasks: myTasks.length,
          completedTasks: myTasks.filter(t => t.status === 'completed').length,
          pendingTasks: myTasks.filter(t => t.status !== 'completed').length,
          overdueTasks: myTasks.filter(t => t.due_date && t.due_date < now && t.status !== 'completed').length,
        });
        setRecentTasks(myTasks.slice(0, 5));
        setRecentActivity(activity.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  return { stats, recentTasks, recentActivity, loading };
}
