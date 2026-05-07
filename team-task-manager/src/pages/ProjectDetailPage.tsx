import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import { useProjects, useProjectMembers } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Task, TaskStatus } from '../types';
import { format, parseISO } from 'date-fns';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, updateProject, deleteProject } = useProjects();
  const { members, addMember, removeMember } = useProjectMembers(id);
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks({ projectId: id });
  const { members: allMembers } = useTeam();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const project = projects.find(p => p.id === id);
  const isAdmin = profile?.role === 'admin';
  const nonMembers = allMembers.filter(m => !members.find(pm => pm.user_id === m.id));

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  const handleDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    setDeleting(true);
    await deleteTask(deleteTaskTarget.id);
    setDeleting(false);
    setDeleteTaskTarget(null);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={15} />
          Back to Projects
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            {project.description && <p className="text-slate-500 text-sm mt-1">{project.description}</p>}
            <p className="text-xs text-slate-400 mt-1">Created {format(parseISO(project.created_at), 'MMMM d, yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowMembers(true)}
              className="btn-secondary text-sm flex items-center gap-2">
              <Users size={15} />
              Members ({members.length})
            </button>
            {isAdmin && (
              <button onClick={() => setShowTaskForm(true)}
                className="btn-primary text-sm flex items-center gap-2">
                <Plus size={15} />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks */}
      {tasksLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Plus size={28} />}
          title="No tasks yet"
          description="Add tasks to this project to get started."
          action={isAdmin ? (
            <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setShowTaskForm(true)}>
              <Plus size={15} />
              Add Task
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={t => { setEditTask(t); setShowTaskForm(true); }}
              onDelete={t => setDeleteTaskTarget(t)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Task form */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditTask(null); }}
        onSubmit={editTask ? (data) => updateTask(editTask.id, data) : createTask}
        task={editTask}
        projects={[project]}
        members={allMembers}
        defaultProjectId={id}
      />

      {/* Delete task */}
      <ConfirmDialog
        isOpen={!!deleteTaskTarget}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Delete "${deleteTaskTarget?.title}"?`}
        loading={deleting}
      />

      {/* Members modal */}
      <Modal isOpen={showMembers} onClose={() => setShowMembers(false)} title="Project Members" size="sm">
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No members yet</p>
          ) : (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-50">
                  <Avatar name={m.profile?.full_name ?? null} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.profile?.full_name || m.profile?.email}</p>
                    <p className="text-xs text-slate-400 truncate">{m.profile?.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.profile?.role === 'admin' ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-600'}`}>
                    {m.profile?.role}
                  </span>
                  {isAdmin && (
                    <button onClick={() => removeMember(m.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {isAdmin && nonMembers.length > 0 && (
            <div className="border-t border-surface-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Add member</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {nonMembers.map(m => (
                  <button key={m.id} onClick={() => addMember(m.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-50 transition-colors text-left">
                    <Avatar name={m.full_name ?? null} size="sm" />
                    <span className="text-sm text-slate-700">{m.full_name || m.email}</span>
                    <UserPlus size={14} className="ml-auto text-brand-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
