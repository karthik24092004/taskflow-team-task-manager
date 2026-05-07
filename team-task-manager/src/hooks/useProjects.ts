import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Project, ProjectMember } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let query;
      if (profile.role === 'admin') {
        query = supabase.from('projects').select('*').order('created_at', { ascending: false });
      } else {
        const { data: memberOf } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', profile.id);
        const projectIds = (memberOf || []).map(m => m.project_id);
        if (projectIds.length === 0) { setProjects([]); setLoading(false); return; }
        query = supabase.from('projects').select('*').in('id', projectIds).order('created_at', { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (name: string, description: string) => {
    if (!profile) return;
    const { data, error } = await supabase.from('projects').insert({
      name, description, owner_id: profile.id
    }).select().single();
    if (error) { toast.error('Failed to create project'); return null; }
    // Auto-add creator as member
    await supabase.from('project_members').insert({ project_id: data.id, user_id: profile.id });
    await supabase.from('activity_logs').insert({
      user_id: profile.id, action: 'created', entity_type: 'project', entity_id: data.id, entity_name: name
    });
    toast.success('Project created!');
    fetchProjects();
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => {
    const { error } = await supabase.from('projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('Failed to update project'); return false; }
    toast.success('Project updated!');
    fetchProjects();
    return true;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { toast.error('Failed to delete project'); return false; }
    toast.success('Project deleted');
    fetchProjects();
    return true;
  };

  return { projects, loading, fetchProjects, createProject, updateProject, deleteProject };
}

export function useProjectMembers(projectId: string | undefined) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('project_members')
      .select('*, profile:profiles(*)')
      .eq('project_id', projectId);
    if (!error) setMembers(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const addMember = async (userId: string) => {
    const exists = members.find(m => m.user_id === userId);
    if (exists) { toast.error('User is already a member'); return false; }
    const { error } = await supabase.from('project_members').insert({ project_id: projectId, user_id: userId });
    if (error) { toast.error('Failed to add member'); return false; }
    toast.success('Member added!');
    fetchMembers();
    return true;
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('project_members').delete().eq('id', memberId);
    if (error) { toast.error('Failed to remove member'); return false; }
    toast.success('Member removed');
    fetchMembers();
    return true;
  };

  return { members, loading, fetchMembers, addMember, removeMember };
}
