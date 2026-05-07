import { Project } from '../../types';
import { FolderKanban, Users, CheckSquare, Edit2, Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const projectColors = [
  'from-violet-400 to-brand-500',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
];

function getColor(id: string) {
  const index = id.charCodeAt(0) % projectColors.length;
  return projectColors[index];
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const gradient = getColor(project.id);

  return (
    <div className="card group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
      onClick={() => navigate(`/projects/${project.id}`)}>
      {/* Color header */}
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center flex-shrink-0">
            <FolderKanban size={18} className="text-slate-500" />
          </div>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onEdit(project); }}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(project); }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 mb-1 truncate">{project.name}</h3>
        {project.description ? (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
        ) : (
          <p className="text-sm text-slate-400 italic mb-4">No description</p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-surface-100 pt-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {format(parseISO(project.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
}
