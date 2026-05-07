import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Zap, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/team', icon: Users, label: 'Team' },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white border-r border-surface-200 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">TaskFlow</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-4 pb-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          profile?.role === 'admin'
            ? 'bg-brand-50 text-brand-700'
            : 'bg-emerald-50 text-emerald-700'
        }`}>
          {profile?.role === 'admin' ? '⚡ Admin' : '👤 Member'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-surface-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
          <Avatar name={profile?.full_name ?? profile?.email ?? null} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
