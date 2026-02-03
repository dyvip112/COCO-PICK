
import React, { useState } from 'react';
import { MatchSettings, MatchState, CompletedMatch } from '../types';
import { handlePoint, handleSideOut, undoState, handleManualSwapPlayersKeepServer, handleManualSwapSides } from '../logic';
import { ArrowLeft, RotateCcw, AlertTriangle, ChevronRight, CheckCircle2, Repeat, UserRoundPen, PlayCircle, Info, Zap, ShieldCheck, UserCog } from 'lucide-react';

interface Props {
  settings: MatchSettings;
  state: MatchState;
  setState: React.Dispatch<React.SetStateAction<MatchState>>;
  onExit: () => void;
  onFinish: (match: CompletedMatch) => void;
}

const MatchScreen: React.FC<Props> = ({ settings, state, setState, onExit, onFinish }) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { scores, servingTeam, serverNumber, serverPlayerIdx, receiverPlayerIdx, teamPositions, isGameOver, visualSideSwapped } = state;

  const [firstServerInfo, setFirstServerInfo] = useState<{team: 0|1, playerIdx: number} | null>(null);
  const [firstReceiverInfo, setFirstReceiverInfo] = useState<{team: 0|1, playerIdx: number} | null>(null);

  const onPoint = (teamIdx: 0 | 1) => {
    if (isGameOver || servingTeam !== teamIdx) return;
    setState(prev => handlePoint(prev, teamIdx, settings));
  };

  const onSideOut = () => {
    if (isGameOver) return;
    setState(prev => handleSideOut(prev));
  };

  const onUndo = () => {
    setState(prev => undoState(prev));
  };

  const onManualSwapPlayers = (teamIdx: 0 | 1, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setState(prev => handleManualSwapPlayersKeepServer(prev, teamIdx));
  };

  const onManualSwapSides = () => {
    setState(prev => handleManualSwapSides(prev));
  };

  const handleConfirmSetup = () => {
    if (!firstServerInfo || !firstReceiverInfo) return;
    setIsSetupComplete(true);
  };

  const [swapConfirmTeam, setSwapConfirmTeam] = useState<0 | 1 | null>(null);

  const handleFinish = () => {
    const completedMatch: CompletedMatch = {
      id: Date.now().toString(),
      teams: settings.teams,
      scores: state.scores,
      winningPoint: settings.winningPoint,
      date: new Date().toLocaleString('vi-VN'),
      groupName: settings.groupName
    };
    onFinish(completedMatch);
  };

  const handleSelectInitialServer = (teamIdx: 0 | 1, areaIdx: number) => {
    const receivingTeamIdx = (1 - teamIdx) as 0 | 1;
    
    setState(prev => {
      let newPositions = [...prev.teamPositions] as [[number, number], [number, number]];
      
      // Pickleball rule: At 0-0, the server must be on the RIGHT (Area 0)
      if (areaIdx === 1) {
        const [p0, p1] = newPositions[teamIdx];
        newPositions[teamIdx] = [p1, p0];
      }

      // Receiver also on their RIGHT (Area 0)
      const [r0, r1] = newPositions[receivingTeamIdx];
      newPositions[receivingTeamIdx] = [r0, r1]; 

      return { 
        ...prev, 
        servingTeam: teamIdx,
        serverNumber: 2, // First team to serve starts at server 2
        serverPlayerIdx: newPositions[teamIdx][0],
        receiverPlayerIdx: newPositions[receivingTeamIdx][0],
        teamPositions: newPositions
      };
    });

    setFirstServerInfo({ team: teamIdx, playerIdx: teamPositions[teamIdx][areaIdx === 1 ? 1 : 0] });
    setFirstReceiverInfo({ team: receivingTeamIdx, playerIdx: teamPositions[receivingTeamIdx][0] });
  };

  const renderSide = (teamIdx: 0 | 1, isSetupPhase: boolean = false) => {
    const isServingSide = servingTeam === teamIdx;
    const isVisualLeft = (teamIdx === 0 && !visualSideSwapped) || (teamIdx === 1 && visualSideSwapped);
    const areaIndices = isVisualLeft ? [1, 0] : [0, 1]; 

    const [sRight, sLeft] = teamPositions[servingTeam];
    const activeServerArea = serverPlayerIdx === sRight ? 0 : 1;
    const receivingTeam = (1 - servingTeam) as 0 | 1;
    const [rRight, rLeft] = teamPositions[receivingTeam];
    const activeReceiverArea = receiverPlayerIdx === rRight ? 0 : 1; 

    return (
      <div
        className={`relative flex-1 flex transition-all duration-700 
          ${!isSetupPhase && !isServingSide && !isGameOver ? 'opacity-60' : 'opacity-100'} 
          ${isServingSide && !isSetupPhase && !isGameOver ? 'ring-2 ring-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.2)]' : ''} 
          ${isVisualLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <div
          className={`flex-1 flex flex-col gap-1 ${isVisualLeft ? 'pr-1' : 'pl-1'} ${
            isServingSide && !isSetupPhase && !isGameOver
              ? teamIdx === 0
                ? 'bg-blue-500/60'
                : 'bg-blue-500/60'
              : teamIdx === 0
                ? 'bg-blue-900/40'
                : 'bg-blue-800/40'
          }`}
        >
          {areaIndices.map((areaIdx) => {
            const playerIndexInTeam = teamPositions[teamIdx][areaIdx];
            const isInitialServer = firstServerInfo?.team === teamIdx && firstServerInfo?.playerIdx === playerIndexInTeam;
            const isInitialReceiver = firstReceiverInfo?.team === teamIdx && firstReceiverInfo?.playerIdx === playerIndexInTeam;

            const isActiveServer = (isSetupPhase && isInitialServer) || (!isSetupPhase && isServingSide && areaIdx === activeServerArea);
            const isActiveReceiver = (isSetupPhase && isInitialReceiver) || (!isSetupPhase && !isServingSide && areaIdx === activeReceiverArea);

            const isDimmed = isSetupPhase && !!firstServerInfo && !(isInitialServer || isInitialReceiver);

            return (
              <div 
                key={areaIdx} 
                onClick={isSetupPhase ? () => handleSelectInitialServer(teamIdx, areaIdx) : undefined}
                className={`flex-1 flex flex-col items-center justify-center relative transition-all duration-500 overflow-hidden
                  ${isSetupPhase ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                  ${isInitialServer ? 'bg-blue-500/50 shadow-[inset_0_0_60px_rgba(255,255,255,0.1)]' : 'bg-blue-600/90'} 
                  ${isDimmed ? 'opacity-20 grayscale brightness-50' : 'opacity-100'}`}
              >
                {isActiveServer && !isGameOver && <div className="absolute inset-0 bg-yellow-400/5 animate-pulse pointer-events-none"></div>}

                <div className="flex flex-col items-center justify-center px-1 z-10 text-center scale-[0.9]">
                  <div className="flex items-center gap-1.5 justify-center mb-1">
                    {isInitialServer && <Zap className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" size={14} />}
                    {isInitialReceiver && <ShieldCheck className="text-white fill-white/20" size={14} />}
                    <div className={`text-[11px] font-black uppercase tracking-tight ${isActiveServer || isActiveReceiver || isSetupPhase ? 'text-white' : 'text-white/30'}`}>
                      {settings.teams[teamIdx].players[playerIndexInTeam].name}
                    </div>
                  </div>
                  
                  <div className="min-h-[24px] flex items-center justify-center">
                    {isActiveServer ? (
                      <div className="flex flex-col items-center gap-1">
                         <div className="bg-yellow-400 text-black px-3 py-0.5 rounded-full shadow-lg border-b border-yellow-600">
                            <span className="text-[8px] font-black uppercase tracking-tight">ĐANG GIAO</span>
                         </div>
                         <span className="text-[6px] font-black text-yellow-200 uppercase italic tracking-tighter">LƯỢT {isSetupPhase ? 2 : serverNumber}</span>
                      </div>
                    ) : isActiveReceiver ? (
                      <div className="bg-blue-300 text-blue-950 px-3 py-0.5 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.7)] border border-white/60">
                        <span className="text-[8px] font-black uppercase tracking-tight">ĐANG ĐỠ</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* manual swap button removed */}
              </div>
            );
          })}
        </div>
        
        <div
          className={`w-[20%] ${
            isServingSide && !isSetupPhase && !isGameOver
              ? 'bg-[#22c55e]'
              : teamIdx === 0
                ? 'bg-[#064e3b]'
                : 'bg-[#10b981]'
          } flex items-center justify-center ${isVisualLeft ? 'border-l' : 'border-r'} border-white/5`}
        >
          <span className={`${isVisualLeft ? 'rotate-90' : '-rotate-90'} text-[7px] font-black tracking-[0.2em] text-white/5 uppercase`}>KITCHEN</span>
        </div>
      </div>
    );
  };

  if (!isSetupComplete) {
    return (
      <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-slate-900 border-b border-white/5">
          <button onClick={onExit} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
          <div className="text-center">
            <h2 className="text-sm font-black uppercase italic tracking-tighter text-blue-400">CHỌN NGƯỜI GIAO ĐẦU</h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">{settings.groupName || 'PICK POSITIONS'}</p>
          </div>
          <button onClick={onManualSwapSides} className="p-2.5 bg-slate-800 rounded-xl text-blue-400 active:scale-90"><Repeat size={20} /></button>
        </div>

        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
          <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl flex items-start gap-4">
             <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400"><Info size={20} /></div>
             <div className="space-y-1">
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-wider">HƯỚNG DẪN:</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                 - Nhấn chọn VĐV sẽ **GIAO BÓNG ĐẦU TIÊN**.<br/>
                 - Hệ thống tự động xếp họ vào bên **PHẢI** sân (0-0).
               </p>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">
                 Nhấp vào ô tối để đổi VĐV đỡ/giao
               </p>
             </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full aspect-[16/9] bg-slate-950 rounded-[3rem] overflow-hidden border-[6px] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative flex">
              {renderSide(!visualSideSwapped ? 0 : 1, true)}
              <div className="w-2 bg-white relative z-30">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-black/10 h-full"></div>
              </div>
              {renderSide(!visualSideSwapped ? 1 : 0, true)}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40 border-t border-white/5 pb-12">
          <button 
            onClick={handleConfirmSetup}
            disabled={!firstServerInfo}
            className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] border-b-[10px] shadow-2xl active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-4 ${firstServerInfo ? 'bg-blue-600 border-blue-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-600 opacity-50'}`}
          >
            BẮT ĐẦU TRẬN <PlayCircle size={28} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#05070a] text-white overflow-hidden safe-area-padding">
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-slate-900 border-b border-white/5 z-50">
        <button onClick={onExit} className="p-2 text-slate-400 active:scale-90"><ArrowLeft size={20} /></button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
              {settings.groupName ? `${settings.groupName} • ` : ''}CHẠM {settings.winningPoint}
            </span>
          </div>
          <span className="text-[9px] text-slate-600 font-bold uppercase italic tracking-widest">COCO PICK REFEREE</span>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-0">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center gap-2 mb-3 pointer-events-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setSwapConfirmTeam(0)}
              className="bg-blue-700/40 hover:bg-blue-600/40 px-4 py-2 rounded-xl flex items-center justify-center text-[10px] font-black text-blue-200 uppercase tracking-widest border border-blue-400/30 active:scale-95"
            >
              ĐỔI VỊ TRÍ ĐỘI A
            </button>
            <button
              onClick={() => setSwapConfirmTeam(1)}
              className="bg-green-700/40 hover:bg-green-600/40 px-4 py-2 rounded-xl flex items-center justify-center text-[10px] font-black text-green-200 uppercase tracking-widest border border-green-400/30 active:scale-95"
            >
              ĐỔI VỊ TRÍ ĐỘI B
            </button>
          </div>
          {swapConfirmTeam !== null && (
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">
                Xác nhận đổi vị trí {swapConfirmTeam === 0 ? 'Đội A' : 'Đội B'}?
              </span>
              <button
                onClick={() => {
                  onManualSwapPlayers(swapConfirmTeam);
                  setSwapConfirmTeam(null);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-300/40"
              >
                OK
              </button>
              <button
                onClick={() => setSwapConfirmTeam(null)}
                className="bg-white/10 text-white/80 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
        <div className="w-full h-full max-w-[1200px] mx-auto flex flex-col items-center justify-center relative min-h-0 pointer-events-none">
          <div className="w-full aspect-[16/9] max-h-full flex rounded-[2.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)] border-[6px] border-white/10 bg-slate-900/50 relative pointer-events-none">
            {!visualSideSwapped ? renderSide(0) : renderSide(1)}
            <div className="w-3.5 bg-white relative z-20">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-black/30 h-full"></div>
            </div>
            {!visualSideSwapped ? renderSide(1) : renderSide(0)}

            {/* BẢNG ĐIỂM THU NHỎ - CẢI TIẾN DẠNG CAPSULE */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <div className="flex flex-col items-center gap-1">
                <div className="bg-[#0f172a]/95 backdrop-blur-2xl px-6 py-2.5 rounded-[2rem] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.55)] flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${servingTeam === (!visualSideSwapped ? 0 : 1) ? 'text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'text-white/70'}`}>
                      {settings.teams[!visualSideSwapped ? 0 : 1].name}
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-white leading-none tabular-nums drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]">{scores[!visualSideSwapped ? 0 : 1]}</span>
                  </div>
                  <div className="w-[2px] h-8 bg-white/10 rounded-full"></div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${servingTeam === (!visualSideSwapped ? 1 : 0) ? 'text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'text-white/70'}`}>
                      {settings.teams[!visualSideSwapped ? 1 : 0].name}
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-white leading-none tabular-nums drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]">{scores[!visualSideSwapped ? 1 : 0]}</span>
                  </div>
                </div>
                <div className="-mt-1 bg-blue-500 text-white px-5 py-1.5 rounded-full font-black shadow-[0_0_24px_rgba(59,130,246,0.85)] border border-blue-200/70 text-[11px] uppercase tracking-[0.3em] relative z-40">
                  LƯỢT PHÁT {serverNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Compact scoreboard: Serving - Receiving - Server # */}
          <div className="mt-4 z-40">
            <div className="bg-slate-900/85 border border-white/15 px-7 py-2.5 rounded-2xl text-white font-black text-base tracking-[0.25em] flex items-center gap-5 shadow-[0_12px_34px_rgba(0,0,0,0.7)]">
              <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]">
                {scores[servingTeam]}
              </span>
              <span className="text-white/40">-</span>
              <span className="text-white/90">
                {scores[1 - servingTeam]}
              </span>
              <span className="text-white/30">|</span>
              <span className="text-blue-200 drop-shadow-[0_0_6px_rgba(191,219,254,0.7)]">
                {serverNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-900/95 backdrop-blur-3xl border-t border-white/10 space-y-4 pb-20 sm:pb-16 shrink-0 relative z-50">
        <div className="grid grid-cols-4 gap-3">
          {(() => {
            const leftTeamIdx: 0 | 1 = visualSideSwapped ? 1 : 0;
            const rightTeamIdx: 0 | 1 = visualSideSwapped ? 0 : 1;
            const renderPointButton = (teamIdx: 0 | 1) => (
              <button 
                onClick={() => onPoint(teamIdx)}
                disabled={servingTeam !== teamIdx}
                className={`col-span-1 border transition-all py-6 sm:py-8 rounded-2xl flex flex-col items-center justify-center font-bold text-xs ${servingTeam === teamIdx ? (teamIdx === 0 ? 'bg-blue-600/30 border-blue-500 text-blue-300 active:scale-95' : 'bg-green-600/30 border-green-500 text-green-300 active:scale-95') : 'bg-white/5 border-white/5 text-slate-700 opacity-30 pointer-events-none'}`}
              >
                <span className="uppercase text-[8px] tracking-widest opacity-60 mb-1">{teamIdx === 0 ? 'Đội A' : 'Đội B'}</span>
                <span className="font-black">+ ĐIỂM</span>
              </button>
            );
            return (
              <>
                {renderPointButton(leftTeamIdx)}
                <button 
                  onClick={onSideOut}
                  className="col-span-2 bg-red-600 hover:bg-red-500 active:translate-y-1 active:border-b-0 py-6 sm:py-8 rounded-2xl flex flex-col items-center justify-center font-black text-xl sm:text-2xl shadow-xl transition-all border-b-[8px] border-red-900"
                >
                  {serverNumber === 1 ? 'LỖI (SANG S2)' : 'ĐỔI GIAO'}
                </button>
                {renderPointButton(rightTeamIdx)}
              </>
            );
          })()}

        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button onClick={onManualSwapSides} className="bg-slate-800/80 hover:bg-slate-700 py-3.5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest border border-white/10 active:scale-95">
            <Repeat size={16} /> ĐỔI SÂN
          </button>
          <button onClick={onUndo} className="bg-red-600 hover:bg-red-500 py-3.5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black text-white uppercase tracking-widest border border-white/10 active:scale-95">
            <RotateCcw size={16} /> HOÀN TÁC
          </button>
          <button onClick={() => {}} className="bg-slate-800/80 hover:bg-slate-700 py-3.5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black text-yellow-500 uppercase tracking-widest border border-white/10 active:scale-95">
            <AlertTriangle size={16} /> LỖI
          </button>
        </div>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 bg-slate-950/99 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_100px_rgba(34,197,94,0.6)]">
            <CheckCircle2 size={50} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 uppercase italic">KẾT THÚC</h2>
          <p className="text-xl text-green-400 font-black mb-8 uppercase tracking-[0.4em]">
            {scores[0] > scores[1] ? settings.teams[0].name : settings.teams[1].name} THẮNG!
          </p>
          <div className="text-[5rem] font-black text-white mb-10 flex items-center gap-8 bg-white/5 px-12 py-6 rounded-[3rem] border border-white/10 shadow-inner">
            <span>{scores[0]}</span>
            <span className="text-slate-800">-</span>
            <span>{scores[1]}</span>
          </div>
          <button onClick={handleFinish} className="w-full max-w-sm bg-white text-black font-black py-5 rounded-[3rem] flex items-center justify-center gap-4 active:scale-95 uppercase tracking-[0.3em] text-xl">
            HOÀN TẤT <ChevronRight size={28} strokeWidth={6} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchScreen;
