import { TaskStatus, TaskPriority } from '../../types';
import { Circle, Clock, CheckCircle2, ArrowDown, Minus, ArrowUp } from 'lucide-react';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const configs = {
    todo: { label: 'To Do', icon: Circle, className: 'badge-todo' },
    in_progress: { label: 'In Progress', icon: Clock, className: 'badge-in_progress' },
    completed: { label: 'Completed', icon: CheckCircle2, className: 'badge-completed' },
  };
  const { label, icon: Icon, className } = configs[status];
  return (
    <span className={className}>
      <Icon size={11} />
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const configs = {
    low: { label: 'Low', icon: ArrowDown, className: 'badge-low' },
    medium: { label: 'Medium', icon: Minus, className: 'badge-medium' },
    high: { label: 'High', icon: ArrowUp, className: 'badge-high' },
  };
  const { label, icon: Icon, className } = configs[priority];
  return (
    <span className={className}>
      <Icon size={11} />
      {label}
    </span>
  );
}
