import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Project } from '../../types';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<any>;
  project?: Project | null;
}

export function ProjectForm({ isOpen, onClose, onSubmit, project }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) { setName(project.name); setDescription(project.description || ''); }
    else { setName(''); setDescription(''); }
  }, [project, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onSubmit(name, description);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'New Project'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Marketing Website" className="input-field" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Optional project description..." className="input-field resize-none" rows={3} />
        </div>
        <div className="flex gap-3 pt-1 justify-end">
          <button type="button" className="btn-secondary text-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary text-sm" disabled={loading}>
            {loading ? 'Saving...' : project ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
