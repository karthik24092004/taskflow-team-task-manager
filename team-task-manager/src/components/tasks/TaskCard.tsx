import { Task, TaskStatus } from '../../types';
import { StatusBadge, PriorityBadge } from './TaskBadges';
import { Avatar } from '../ui/Avatar';
import { Calendar, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isOwner = task.assigned_to === profile?.id;
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed';

  return (
    <div className={`card p-4 group hover:shadow-md transition-all duration-200 animate-fade-in ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                <AlertCircle size={11} />
                Overdue
              </span>
            )}
          </div>
          <h3 className={`text-sm font-semibold text-slate-800 mb-1 truncate ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {task.project && (
              <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]">
                {task.project.name}
              </span>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                <Calendar size={11} />
                {format(parseISO(task.due_date), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {task.assignee && (
            <Avatar name={task.assignee.full_name || task.assignee.email} size="xs" />
          )}
          {(isAdmin || isOwner) && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {isAdmin && (
                <button onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors">
                  <Edit2 size={13} />
                </button>
              )}
              {isAdmin && (
                <button onClick={() => onDelete(task)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status selector for member's own tasks */}
      {(isAdmin || isOwner) && (
        <div className="mt-3 pt-3 border-t border-surface-100">
          <select
            value={task.status}
            onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  );
}
