import { useTeam } from '../hooks/useTeam';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Avatar } from '../components/ui/Avatar';
import { Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export function TeamPage() {
  const { members, loading } = useTeam();
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="text-slate-500 text-sm mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : members.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No team members" description="Team members will appear here once they sign up." />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-surface-100">
            {members.map(member => (
              <div key={member.id} className={`flex items-center gap-4 p-4 hover:bg-surface-50 transition-colors ${member.id === profile?.id ? 'bg-brand-50/50' : ''}`}>
                <Avatar name={member.full_name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{member.full_name || 'Unnamed User'}</p>
                    {member.id === profile?.id && (
                      <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">You</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{member.email}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    member.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {member.role === 'admin' ? '⚡ Admin' : '👤 Member'}
                  </span>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Joined {format(parseISO(member.created_at), 'MMM yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
