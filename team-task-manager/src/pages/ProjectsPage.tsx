import { useState } from 'react';
import { Plus, FolderKanban, Search } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Project } from '../types';

export function ProjectsPage() {
  const { profile } = useAuth();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const isAdmin = profile?.role === 'admin';

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (name: string, description: string) => {
    await createProject(name, description);
  };

  const handleEdit = async (name: string, description: string) => {
    if (!editProject) return;
    await updateProject(editProject.id, { name, description });
    setEditProject(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteProject(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input-field pl-9 !py-2" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={28} />}
          title={search ? 'No matching projects' : 'No projects yet'}
          description={search ? 'Try a different search.' : isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          action={isAdmin && !search ? (
            <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setShowForm(true)}>
              <Plus size={15} />
              Create Project
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={p => { setEditProject(p); setShowForm(true); }}
              onDelete={p => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      <ProjectForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditProject(null); }}
        onSubmit={editProject ? handleEdit : handleCreate}
        project={editProject}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all tasks in this project.`}
        loading={deleting}
      />
    </div>
  );
}
