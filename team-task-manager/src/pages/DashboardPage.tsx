import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge, PriorityBadge } from '../components/tasks/TaskBadges';
import { Avatar } from '../components/ui/Avatar';
import {
  FolderKanban, CheckSquare, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Activity
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

export function DashboardPage() {
  const { profile } = useAuth();
  const { stats, recentTasks, recentActivity, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue', value: stats.overdueTasks, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Here's what's happening with your projects today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900 text-sm">Task Progress</h2>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                  strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{completionRate}%</span>
                <span className="text-xs text-slate-500">Done</span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Completed', count: stats.completedTasks, color: 'bg-emerald-500' },
              { label: 'In Progress', count: stats.pendingTasks - stats.overdueTasks, color: 'bg-blue-500' },
              { label: 'Overdue', count: stats.overdueTasks, color: 'bg-red-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-slate-600 flex-1">{label}</span>
                <span className="text-xs font-semibold text-slate-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare size={16} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900 text-sm">Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => {
                const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed';
                return (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl ${isOverdue ? 'bg-red-50' : 'bg-surface-50'}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    {task.assignee && <Avatar name={task.assignee.full_name} size="xs" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-brand-600" />
          <h2 className="font-semibold text-slate-900 text-sm">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(log => (
              <div key={log.id} className="flex items-center gap-3">
                <Avatar name={log.profile?.full_name ?? null} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{log.profile?.full_name || 'Someone'}</span>
                    {' '}{log.action}{' '}
                    <span className="font-medium text-brand-700">"{log.entity_name}"</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(parseISO(log.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
