interface AvatarProps {
  name: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

const colors = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
];

function getColor(name: string) {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const colorClass = name ? getColor(name) : 'bg-surface-200 text-slate-500';
  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
