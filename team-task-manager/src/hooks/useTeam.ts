import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import toast from 'react-hot-toast';

export function useTeam() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at');
    if (!error) setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  return { members, loading, fetchMembers };
}
