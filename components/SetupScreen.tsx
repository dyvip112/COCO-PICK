
import React, { useState, useEffect } from 'react';
import { MatchSettings, CompletedMatch } from '../types';
import { DEFAULT_TEAM_1_NAME, DEFAULT_TEAM_2_NAME } from '../constants';
import { Settings, Play, Users, Target, RefreshCw, History, Download, X, Share, PlusSquare, MoreVertical, Trash2, LayoutGrid, UserRoundPen } from 'lucide-react';

interface Props {
  onStart: (settings: MatchSettings) => void;
  history: CompletedMatch[];
  onClearHistory: () => void;
  authUser: { username: string; displayName: string };
  onUpdateProfile: (username: string, displayName: string, password?: string) => void;
  onLogout: () => void;
}

const SetupScreen: React.FC<Props> = ({ onStart, history, onClearHistory, authUser, onUpdateProfile, onLogout }) => {
  const [winningPoint, setWinningPoint] = useState(11);
  const [sideChangePoint, setSideChangePoint] = useState(6);
  const [winByTwo, setWinByTwo] = useState(true);
  const [team1Name, setTeam1Name] = useState(DEFAULT_TEAM_1_NAME);
  const [team2Name, setTeam2Name] = useState(DEFAULT_TEAM_2_NAME);
  const [groupName, setGroupName] = useState('BẢNG A');
  const [p1_1, setP1_1] = useState('VĐV 1');
  const [p1_2, setP1_2] = useState('VĐV 2');
  const [p2_1, setP2_1] = useState('VĐV 3');
  const [p2_2, setP2_2] = useState('VĐV 4');

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState(authUser.displayName);
  const [profilePass, setProfilePass] = useState('');

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleStart = () => {
      onStart({
        winningPoint,
        sideChangePoint,
        winByTwo,
        initialSide: 'left',
        initialServerTeam: 0, 
        initialServerPlayerIdx: 0, // Sẽ được chọn lại ở màn hình sau
        initialReceiverPlayerIdx: 0, // Sẽ được chọn lại ở màn hình sau
        groupName,
      teams: [
        { name: team1Name, players: [{ name: p1_1 }, { name: p1_2 }] },
        { name: team2Name, players: [{ name: p2_1 }, { name: p2_2 }] },
      ]
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <header className="flex items-center justify-between px-6 pt-10 pb-4 bg-slate-900/50 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase italic leading-none tracking-tighter">COCO PICK</h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Referee Pro</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-end text-right mr-3">
          <div className="text-[10px] font-black text-white uppercase tracking-widest">{authUser.displayName}</div>
          <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Trọng tài</div>
        </div>
        <button
          onClick={() => {
            setProfileName(authUser.displayName);
            setProfilePass('');
            setShowProfile(true);
          }}
          className="p-2.5 bg-slate-800 rounded-xl text-slate-300 active:scale-90 transition-all border border-white/5"
        >
          <UserRoundPen size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide pb-32">
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/5 space-y-3">
          <h2 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2 px-1">
            <LayoutGrid size={14} /> BẢNG THI ĐẤU
          </h2>
          <input 
            className="w-full bg-slate-800/40 border border-white/5 rounded-xl p-3 text-sm text-white placeholder-slate-700 font-bold outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Ví dụ: Bảng A, Bảng B..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <Target size={10} /> SỐ ĐIỂM THI ĐẤU
            </label>
            <select 
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none"
              value={winningPoint}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setWinningPoint(val);
                setSideChangePoint(Math.floor(val / 2) + 1);
              }}
            >
              {[11, 15, 21].map(p => <option key={p} value={p}>{p} Điểm</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <RefreshCw size={10} /> ĐỔI SÂN
            </label>
            <select 
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none"
              value={sideChangePoint}
              onChange={(e) => setSideChangePoint(parseInt(e.target.value))}
            >
              {[6, 8, 11].map(p => <option key={p} value={p}>{p} Điểm</option>)}
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/5 space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Target size={10} /> HÌNH THỨC THẮNG
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWinByTwo(false)}
              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                !winByTwo
                  ? 'bg-blue-600 text-white border-blue-400/50 shadow-[0_0_16px_rgba(59,130,246,0.5)]'
                  : 'bg-slate-800/60 text-slate-300 border-white/10'
              }`}
            >
              Chạm điểm là thắng
            </button>
            <button
              onClick={() => setWinByTwo(true)}
              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                winByTwo
                  ? 'bg-green-600 text-white border-green-400/50 shadow-[0_0_16px_rgba(34,197,94,0.5)]'
                  : 'bg-slate-800/60 text-slate-300 border-white/10'
              }`}
            >
              Cách 2 điểm
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="font-black text-blue-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Users size={14} /> ĐỘI A
            </h2>
          </div>
          <input 
            className="w-full bg-slate-800/40 border border-white/5 rounded-xl p-3 text-sm text-white placeholder-slate-700 font-bold outline-none"
            placeholder="Tên Đội A"
            value={team1Name}
            onChange={(e) => setTeam1Name(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input className="bg-slate-800/20 border border-white/5 p-2.5 rounded-lg text-xs font-bold text-slate-300 outline-none" placeholder="VĐV 1" value={p1_1} onChange={e => setP1_1(e.target.value)} />
            <input className="bg-slate-800/20 border border-white/5 p-2.5 rounded-lg text-xs font-bold text-slate-300 outline-none" placeholder="VĐV 2" value={p1_2} onChange={e => setP1_2(e.target.value)} />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="font-black text-green-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Users size={14} /> ĐỘI B
            </h2>
          </div>
          <input 
            className="w-full bg-slate-800/40 border border-white/5 rounded-xl p-3 text-sm text-white placeholder-slate-700 font-bold outline-none"
            placeholder="Tên Đội B"
            value={team2Name}
            onChange={(e) => setTeam2Name(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input className="bg-slate-800/20 border border-white/5 p-2.5 rounded-lg text-xs font-bold text-slate-300 outline-none" placeholder="VĐV 3" value={p2_1} onChange={e => setP2_1(e.target.value)} />
            <input className="bg-slate-800/20 border border-white/5 p-2.5 rounded-lg text-xs font-bold text-slate-300 outline-none" placeholder="VĐV 4" value={p2_2} onChange={e => setP2_2(e.target.value)} />
          </div>
        </div>

        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <History size={12} /> LỊCH SỬ GẦN ĐÂY
              </h3>
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="text-[8px] font-black text-red-500/70 hover:text-red-500 active:scale-90 transition-all uppercase tracking-widest flex items-center gap-1.5 bg-red-500/5 px-2.5 py-1 rounded-md border border-red-500/10"
              >
                <Trash2 size={10} /> XÓA LỊCH SỬ
              </button>
            </div>
            <div className="space-y-2">
              {history.map((match) => (
                <div key={match.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 truncate">
                       <span className="text-[9px] font-black text-blue-400 truncate">{match.teams[0].name}</span>
                       <span className="text-[8px] text-slate-700 font-black">VS</span>
                       <span className="text-[9px] font-black text-green-400 truncate">{match.teams[1].name}</span>
                    </div>
                    <div className="text-[8px] text-slate-600 font-bold uppercase">{match.date} {match.groupName ? `• ${match.groupName}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg">
                    <span className="text-sm font-black text-white">{match.scores[0]}</span>
                    <span className="text-slate-700 text-[10px]">-</span>
                    <span className="text-sm font-black text-white">{match.scores[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent shrink-0">
        <button 
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.3)] text-base uppercase tracking-widest border-b-4 border-blue-800"
        >
          <Play fill="currentColor" size={20} /> BẮT ĐẦU TRẬN ĐẤU
        </button>
      </div>

      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-end">
          <div className="w-full bg-slate-900 rounded-t-[2.5rem] p-8 pb-10 border-t border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">TẢI ỨNG DỤNG</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Coco Pick Referee</p>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="p-2 bg-white/5 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {isIOS ? (
                <>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400"><Share size={20} /></div>
                    <p className="text-slate-300 font-bold text-xs leading-relaxed">1. Bấm nút <span className="text-blue-400">Chia sẻ</span> ở Safari.</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400"><PlusSquare size={20} /></div>
                    <p className="text-slate-300 font-bold text-xs leading-relaxed">2. Chọn <span className="text-green-400">"Thêm vào MH chính"</span>.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400"><MoreVertical size={20} /></div>
                    <p className="text-slate-300 font-bold text-xs leading-relaxed">1. Bấm <span className="text-blue-400 underline">dấu 3 chấm</span> trình duyệt.</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400"><Download size={20} /></div>
                    <p className="text-slate-300 font-bold text-xs leading-relaxed">2. Chọn <span className="text-green-400 underline">"Cài đặt ứng dụng"</span>.</p>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-8 bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
            <div className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Xác nhận</div>
            <div className="text-sm font-bold text-white/90 mb-4">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu?
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-red-400/30"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white/90 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/10"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Hồ sơ</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
              {authUser.username}
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tên hiển thị</label>
                <input
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-blue-500/60"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Đổi mật khẩu</label>
                <input
                  type="password"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-blue-500/60"
                  placeholder="Để trống nếu không đổi"
                  value={profilePass}
                  onChange={(e) => setProfilePass(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  onUpdateProfile(authUser.username, profileName, profilePass);
                  setProfilePass('');
                  setShowProfile(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-blue-400/30"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setProfilePass('');
                  setShowProfile(false);
                }}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white/90 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/10"
              >
                Hủy
              </button>
            </div>
            <button
              onClick={() => {
                setShowProfile(false);
                onLogout();
              }}
              className="w-full mt-3 bg-red-600/80 hover:bg-red-500 text-white py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-red-400/30"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupScreen;
