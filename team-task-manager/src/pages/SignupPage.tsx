import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'member' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { fullName, email, password, role } = formData;
    if (!fullName || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Signup failed');
    } else {
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-brand-300 mt-1 text-sm">Start managing tasks with your team</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-100 mb-1.5">Full name</label>
              <input name="fullName" type="text" value={formData.fullName} onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all text-sm"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-100 mb-1.5">Email address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all text-sm"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-100 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all text-sm"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-100 mb-1.5">Role</label>
              <select name="role" value={formData.role} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all text-sm">
                <option value="member" className="text-slate-900">Member</option>
                <option value="admin" className="text-slate-900">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95 mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-300 hover:text-brand-200 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
