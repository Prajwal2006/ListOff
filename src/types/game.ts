export type GameState =
  | "LOBBY"
  | "PREDICTION"
  | "TOPIC_REVEAL"
  | "ANSWERING"
  | "ROUND_PROCESSING"
  | "ROUND_LEADERBOARD"
  | "GAME_FINISHED";

export type RoundStatus = "PREDICTION" | "TOPIC_REVEAL" | "ANSWERING" | "PROCESSING" | "COMPLETE" | "CANCELLED";
export type Difficulty = "easy" | "medium" | "hard";
export type Role = "participant" | "moderator";

export interface PublicParticipant {
  id: string;
  displayName: string;
  avatar: number;
  totalScore: number;
  isConnected: boolean;
  hasPredicted: boolean;
  joinedAt: number;
}

export interface PublicTopic {
  id: number;
  name: string;
  prompt: string;
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  difficulty: Difficulty;
  totalAnswers: number;
}

export interface RoundView {
  id: string;
  number: number;
  status: RoundStatus;
  predictionDeadline: number;
  answeringStartsAt: number | null;
  answeringDeadline: number | null;
  predictionsIn: number;
  eligible: number;
  /** Only present once the round has been revealed. */
  topic: PublicTopic | null;
}

export interface SubmittedAnswerView {
  id: number;
  text: string;
  canonical: string | null;
  isValid: boolean;
  isDuplicate: boolean;
}

export interface MyRoundView {
  prediction: number | null;
  answers: SubmittedAnswerView[];
}

export interface ScoreRow {
  participantId: string;
  displayName: string;
  avatar: number;
  predictedCount: number | null;
  validCount: number;
  roundPoints: number;
  totalScore: number;
  rank: number;
  previousRank: number | null;
  hit: boolean;
}

export interface RoundResultsView {
  roundNumber: number;
  topic: PublicTopic;
  scores: ScoreRow[];
  /** Every canonical answer for the topic, with how many players found it. */
  answerKey: { answer: string; foundBy: number }[];
  mine: SubmittedAnswerView[] | null;
  isFinalRound: boolean;
}

export interface FinalStanding {
  participantId: string;
  displayName: string;
  avatar: number;
  totalScore: number;
  rank: number;
  roundsHit: number;
  roundsPlayed: number;
  totalValid: number;
  bestRound: { roundNumber: number; points: number } | null;
  perRound: { roundNumber: number; predicted: number | null; valid: number; points: number }[];
}

export interface FinalView {
  standings: FinalStanding[];
  rounds: { roundNumber: number; topicName: string; categoryName: string }[];
}

export interface ModeratorView {
  /** Visible once predictions lock (topic revealed). */
  predictions: { participantId: string; displayName: string; predictedCount: number }[] | null;
  /** Live answer counts during answering; full answer lists once the round is scored. */
  answerCounts: Record<string, number>;
  answers: { participantId: string; displayName: string; items: SubmittedAnswerView[] }[] | null;
}

export interface GameInfo {
  code: string;
  name: string;
  hostName: string | null;
  state: GameState;
  currentRound: number;
  totalRounds: number;
  roundDuration: number;
  predictionDuration: number;
  categoryIds: number[] | null;
  nextGameCode: string | null;
  createdAt: number;
}

export interface GameSnapshot {
  unchanged?: false;
  serverNow: number;
  version: number;
  role: Role;
  game: GameInfo;
  participants: PublicParticipant[];
  round: RoundView | null;
  me: { id: string; displayName: string; avatar: number; totalScore: number; round: MyRoundView | null } | null;
  leaderboard: ScoreRow[];
  results: RoundResultsView | null;
  final: FinalView | null;
  moderator: ModeratorView | null;
}

export interface UnchangedSnapshot {
  unchanged: true;
  serverNow: number;
  version: number;
}

export interface AnswerSubmitResponse {
  id: number;
  submittedAnswer: string;
  canonicalAnswer: string | null;
  isValid: boolean;
  isDuplicate: boolean;
  validCount: number;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}
