import React, { useState } from 'react';

interface UserRecord {
  username: string;
  password: string;
  displayName: string;
}

interface Props {
  users: UserRecord[];
  onLogin: (username: string, password: string) => string | null;
}

const LoginScreen: React.FC<Props> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      setError('Sai tài khoản hoặc mật khẩu.');
      return;
    }
    const err = onLogin(username, password);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <div className="text-center mb-6">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">COCO PICK</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Referee Pro</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tài khoản</label>
            <input
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-blue-500/60"
              placeholder="COCOPICK-001"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mật khẩu</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-blue-500/60"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-[10px] text-red-400 font-bold">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white font-black py-3 rounded-2xl uppercase tracking-widest border-b-4 border-blue-800"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
