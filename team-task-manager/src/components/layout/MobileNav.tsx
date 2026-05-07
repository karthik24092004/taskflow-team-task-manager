import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/team', icon: Users, label: 'Team' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900">TaskFlow</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-surface-100 text-slate-600">
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-xl animate-slide-in">
            <div className="px-5 py-5 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="font-bold text-slate-900">TaskFlow</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-surface-100">
              <div className="flex items-center gap-3 p-3 rounded-xl">
                <Avatar name={profile?.full_name ?? null} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                </div>
                <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-red-500">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
