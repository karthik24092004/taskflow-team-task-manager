import { useState, useMemo } from 'react';
import { Plus, CheckSquare, Search, User } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Avatar } from '../components/ui/Avatar';
import { Task, TaskStatus, TaskPriority } from '../types';

type StatusFilter = TaskStatus | 'all';
type PriorityFilter = TaskPriority | 'all';

export function TasksPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search,
  });
  const { projects } = useProjects();
  const { members } = useTeam();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = profile?.role === 'admin';

  // Apply member filter client-side
  const filteredTasks = useMemo(() => {
    if (memberFilter === 'all') return tasks;
    if (memberFilter === 'unassigned') return tasks.filter(t => !t.assigned_to);
    return tasks.filter(t => t.assigned_to === memberFilter);
  }, [tasks, memberFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteTask(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setShowTaskForm(true)}>
            <Plus size={15} />
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        {/* Search + Member filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input-field pl-8 !py-1.5 text-xs" />
          </div>

          {/* Member filter dropdown — admin only */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <select
                value={memberFilter}
                onChange={e => setMemberFilter(e.target.value)}
                className="input-field !py-1.5 text-xs max-w-[180px]"
              >
                <option value="all">All Members</option>
                <option value="unassigned">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status + Priority filter row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            {(['all', 'todo', 'in_progress', 'completed'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={filterBtnClass(statusFilter === s)}>
                {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s === 'todo' ? 'To Do' : 'Completed'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Priority:</span>
            {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)} className={filterBtnClass(priorityFilter === p)}>
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Active member filter badge */}
          {memberFilter !== 'all' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 border border-brand-200 rounded-lg">
              {memberFilter === 'unassigned' ? (
                <span className="text-xs text-brand-700 font-medium">Unassigned</span>
              ) : (
                <>
                  <Avatar
                    name={members.find(m => m.id === memberFilter)?.full_name ?? null}
                    size="xs"
                  />
                  <span className="text-xs text-brand-700 font-medium">
                    {members.find(m => m.id === memberFilter)?.full_name ||
                      members.find(m => m.id === memberFilter)?.email}
                  </span>
                </>
              )}
              <button
                onClick={() => setMemberFilter('all')}
                className="text-brand-400 hover:text-brand-700 ml-1 font-bold text-xs"
              >×</button>
            </div>
          )}
        </div>
      </div>

      {/* Task grid */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="No tasks found"
          description={search || statusFilter !== 'all' || priorityFilter !== 'all' || memberFilter !== 'all' ? 'Try adjusting your filters.' : isAdmin ? 'Create your first task.' : 'No tasks assigned to you yet.'}
          action={isAdmin && !search ? (
            <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setShowTaskForm(true)}>
              <Plus size={15} />
              Create Task
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={t => { setEditTask(t); setShowTaskForm(true); }}
              onDelete={t => setDeleteTarget(t)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditTask(null); }}
        onSubmit={editTask ? (data) => updateTask(editTask.id, data) : createTask}
        task={editTask}
        projects={projects}
        members={members}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Delete "${deleteTarget?.title}"?`}
        loading={deleting}
      />
    </div>
  );
}
