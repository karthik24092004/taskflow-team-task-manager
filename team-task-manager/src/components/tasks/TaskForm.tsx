import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Task, TaskStatus, TaskPriority, Project, Profile } from '../../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  task?: Task | null;
  projects: Project[];
  members: Profile[];
  defaultProjectId?: string;
}

export function TaskForm({ isOpen, onClose, onSubmit, task, projects, members, defaultProjectId }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: defaultProjectId || '',
    assigned_to: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    due_date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        project_id: task.project_id,
        assigned_to: task.assigned_to || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      });
    } else {
      setFormData({ title: '', description: '', project_id: defaultProjectId || '', assigned_to: '', status: 'todo', priority: 'medium', due_date: '' });
    }
  }, [task, isOpen, defaultProjectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project_id) return;
    setLoading(true);
    const payload = {
      ...formData,
      assigned_to: formData.assigned_to || null,
      due_date: formData.due_date || null,
    };
    await onSubmit(payload);
    setLoading(false);
    onClose();
  };

  const inputClass = "input-field";
  const selectClass = "input-field";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Task title *</label>
          <input name="title" type="text" value={formData.title} onChange={handleChange}
            placeholder="Enter task title..." className={inputClass} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            placeholder="Optional description..." className={`${inputClass} resize-none`} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Project *</label>
            <select name="project_id" value={formData.project_id} onChange={handleChange} className={selectClass} required>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assign to</label>
            <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} className={selectClass}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={selectClass}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={selectClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input name="due_date" type="date" value={formData.due_date} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="flex gap-3 pt-2 justify-end">
          <button type="button" className="btn-secondary text-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary text-sm" disabled={loading}>
            {loading ? 'Saving...' : task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
