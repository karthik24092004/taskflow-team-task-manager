import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search?: string;
  projectId?: string;
}

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*, assignee:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
        .order('created_at', { ascending: false });

      if (profile.role === 'member') {
        query = query.eq('assigned_to', profile.id);
      }
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data || [];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(t =>
          t.title.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s)
        );
      }
      setTasks(results);
    } catch (err: any) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [profile, filters.status, filters.priority, filters.search, filters.projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (taskData: {
    title: string;
    description?: string;
    project_id: string;
    assigned_to?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
  }) => {
    if (!profile) return null;
    const { data, error } = await supabase.from('tasks').insert({
      ...taskData,
      created_by: profile.id,
    }).select().single();
    if (error) { toast.error('Failed to create task'); return null; }
    await supabase.from('activity_logs').insert({
      user_id: profile.id, action: 'created', entity_type: 'task', entity_id: data.id, entity_name: taskData.title
    });
    toast.success('Task created!');
    fetchTasks();
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!profile) return false;
    // Members can only update status of their own tasks
    if (profile.role === 'member') {
      const task = tasks.find(t => t.id === id);
      if (!task || task.assigned_to !== profile.id) {
        toast.error('You can only update your own tasks');
        return false;
      }
      const allowedUpdates: Partial<Task> = { status: updates.status };
      const { error } = await supabase.from('tasks').update({ ...allowedUpdates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) { toast.error('Failed to update task'); return false; }
    } else {
      const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) { toast.error('Failed to update task'); return false; }
    }
    if (updates.status) {
      await supabase.from('activity_logs').insert({
        user_id: profile.id, action: `updated status to ${updates.status}`, entity_type: 'task', entity_id: id, entity_name: tasks.find(t => t.id === id)?.title || 'Task'
      });
    }
    toast.success('Task updated!');
    fetchTasks();
    return true;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { toast.error('Failed to delete task'); return false; }
    toast.success('Task deleted');
    fetchTasks();
    return true;
  };

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask };
}
