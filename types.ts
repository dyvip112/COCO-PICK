
export type TeamSide = 'left' | 'right';

export interface Player {
  name: string;
}

export interface Team {
  name: string;
  players: [Player, Player];
}

export interface MatchSettings {
  winningPoint: number;
  sideChangePoint: number;
  winByTwo: boolean;
  teams: [Team, Team];
  initialSide: TeamSide;
  initialServerTeam: 0 | 1;
  initialServerPlayerIdx: number; // Chỉ số VĐV giao đầu tiên của team giao
  initialReceiverPlayerIdx: number; // Chỉ số VĐV đỡ đầu tiên của team nhận
  groupName?: string;
}

export interface MatchState {
  scores: [number, number];
  servingTeam: 0 | 1; 
  serverNumber: 1 | 2;
  serverPlayerIdx: number;
  receiverPlayerIdx: number;
  teamPositions: [[number, number], [number, number]];
  isGameOver: boolean;
  visualSideSwapped: boolean; 
  autoSwapped: boolean;
  history: MatchStateSnapshot[];
}

export interface MatchStateSnapshot {
  scores: [number, number];
  servingTeam: 0 | 1;
  serverNumber: 1 | 2;
  serverPlayerIdx: number;
  receiverPlayerIdx: number;
  teamPositions: [[number, number], [number, number]];
  visualSideSwapped: boolean;
  autoSwapped: boolean;
}

export interface CompletedMatch {
  id: string;
  teams: [Team, Team];
  scores: [number, number];
  winningPoint: number;
  date: string;
  groupName?: string;
}
