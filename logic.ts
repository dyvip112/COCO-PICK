
import { MatchState, MatchStateSnapshot, MatchSettings } from './types';

export const createInitialMatchState = (initialServingTeam: 0 | 1): MatchState => {
  return {
    scores: [0, 0],
    servingTeam: initialServingTeam,
    serverNumber: 2, 
    serverPlayerIdx: 0,
    receiverPlayerIdx: 0,
    teamPositions: [
      [0, 1], 
      [0, 1], 
    ],
    isGameOver: false,
    visualSideSwapped: false,
    autoSwapped: false,
    history: []
  };
};

const recordHistory = (state: MatchState): MatchStateSnapshot => {
  return {
    scores: [...state.scores],
    servingTeam: state.servingTeam,
    serverNumber: state.serverNumber,
    serverPlayerIdx: state.serverPlayerIdx,
    receiverPlayerIdx: state.receiverPlayerIdx,
    teamPositions: [
      [...state.teamPositions[0]],
      [...state.teamPositions[1]]
    ],
    visualSideSwapped: state.visualSideSwapped,
    autoSwapped: state.autoSwapped
  };
};

export const handlePoint = (state: MatchState, winningTeam: 0 | 1, settings: MatchSettings): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));

  if (winningTeam === state.servingTeam) {
    nextState.scores[winningTeam] += 1;
    const [pRight, pLeft] = nextState.teamPositions[winningTeam];
    nextState.teamPositions[winningTeam] = [pLeft, pRight];

    const receivingTeam = (1 - winningTeam) as 0 | 1;
    const [rRight, rLeft] = nextState.teamPositions[receivingTeam];
    nextState.receiverPlayerIdx =
      nextState.receiverPlayerIdx === rRight ? rLeft : rRight;

    // Auto swap sides logic
    if (!nextState.autoSwapped && nextState.scores[winningTeam] === settings.sideChangePoint) {
      nextState.visualSideSwapped = !nextState.visualSideSwapped;
      nextState.autoSwapped = true;
    }

    // Game over logic
    const scoreDiff = nextState.scores[winningTeam] - nextState.scores[1 - winningTeam];
    if (nextState.scores[winningTeam] >= settings.winningPoint && (!settings.winByTwo || scoreDiff >= 2)) {
      nextState.isGameOver = true;
    }
  } else {
    // We reuse handleSideOut logic but need to manage history carefully
    // To avoid double history recording, we just do the logic here
    if (nextState.serverNumber === 1) {
      nextState.serverNumber = 2;
      const [sRight, sLeft] = nextState.teamPositions[nextState.servingTeam];
      nextState.serverPlayerIdx = nextState.serverPlayerIdx === sRight ? sLeft : sRight;

      const receivingTeam = (1 - nextState.servingTeam) as 0 | 1;
      const [rRight, rLeft] = nextState.teamPositions[receivingTeam];
      nextState.receiverPlayerIdx =
        nextState.receiverPlayerIdx === rRight ? rLeft : rRight;
    } else {
      const oldServingTeam = nextState.servingTeam;
      nextState.servingTeam = (1 - nextState.servingTeam) as 0 | 1;
      nextState.serverNumber = 1;
      nextState.serverPlayerIdx = nextState.teamPositions[nextState.servingTeam][0];

      const newReceivingTeam = oldServingTeam;
      nextState.receiverPlayerIdx = nextState.teamPositions[newReceivingTeam][0];
    }
  }
  return nextState;
};

export const handleSideOut = (state: MatchState): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));

  const servingTeam = state.servingTeam; // 0 = Team A, 1 = Team B

  // Only handle side-out on server 2
  if (state.serverNumber === 2) {
    // Switch serving team without moving player names between cells
    nextState.servingTeam = (1 - servingTeam) as 0 | 1;
    nextState.serverNumber = 1;
    nextState.serverPlayerIdx = nextState.teamPositions[nextState.servingTeam][0];

    const newReceivingTeam = servingTeam;
    nextState.receiverPlayerIdx = nextState.teamPositions[newReceivingTeam][0];
    return nextState;
  }

  // If currently server 1, move to server 2
  nextState.serverNumber = 2;
  const [sRight, sLeft] = nextState.teamPositions[servingTeam];
  nextState.serverPlayerIdx = nextState.serverPlayerIdx === sRight ? sLeft : sRight;

  const receivingTeam = (1 - servingTeam) as 0 | 1;
  const [rRight, rLeft] = nextState.teamPositions[receivingTeam];
  nextState.receiverPlayerIdx =
    nextState.receiverPlayerIdx === rRight ? rLeft : rRight;
  return nextState;
};
export const handleManualSwapPlayers = (state: MatchState, teamIdx: 0 | 1): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));
  const [pRight, pLeft] = nextState.teamPositions[teamIdx];
  nextState.teamPositions[teamIdx] = [pLeft, pRight];
  return nextState;
};

export const handleManualSwapPlayersKeepServer = (state: MatchState, teamIdx: 0 | 1): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));

  const prevServerPlayer = state.serverPlayerIdx;
  const prevReceiverPlayer = state.receiverPlayerIdx;

  const [pRight, pLeft] = nextState.teamPositions[teamIdx];
  nextState.teamPositions[teamIdx] = [pLeft, pRight];

  // Preserve who is serving, and always swap receiver indicator to the other receiver
  nextState.serverPlayerIdx = prevServerPlayer;
  const receivingTeam = (1 - state.servingTeam) as 0 | 1;
  const [rRight, rLeft] = nextState.teamPositions[receivingTeam];
  nextState.receiverPlayerIdx = prevReceiverPlayer === rRight ? rLeft : rRight;

  return nextState;
};

export const handleManualSwapSides = (state: MatchState): MatchState => {
  const nextState: MatchState = JSON.parse(JSON.stringify(state));
  nextState.history.push(recordHistory(state));
  nextState.visualSideSwapped = !nextState.visualSideSwapped;
  return nextState;
};

export const undoState = (state: MatchState): MatchState => {
  if (state.history.length === 0) return state;
  const history = [...state.history];
  const lastSnapshot = history.pop()!;
  return {
    ...state,
    ...lastSnapshot,
    history,
    isGameOver: false
  };
};
