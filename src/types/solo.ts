import type { CountryCode } from "@/data/regions";
import type { PublicTopic } from "./game";

export type LeaderboardScope = "national" | "state" | "university";

export interface UniversityView {
  id: number;
  name: string;
  country: CountryCode;
  stateCode: string;
  isCustom: boolean;
}

export interface SoloProfileView {
  displayName: string;
  country: CountryCode;
  stateCode: string;
  stateName: string;
  university: UniversityView;
  totalPoints: number;
  roundsPlayed: number;
  bidsHit: number;
  bestRound: number;
  /** null until the player has finished a round. */
  ranks: { national: number | null; state: number | null; university: number | null };
}

export interface MeResponse {
  user: { id: string; email: string; name: string } | null;
  profile: SoloProfileView | null;
  authEnabled: boolean;
}

export interface SoloRoundView {
  id: string;
  status: "PREDICTION" | "ANSWERING" | "COMPLETE" | "ABANDONED";
  topic: PublicTopic;
  predictedCount: number | null;
  roundDuration: number;
  answeringStartsAt: number | null;
  answeringDeadline: number | null;
  serverNow: number;
  answers: { text: string; canonical: string | null; isValid: boolean; isDuplicate: boolean }[];
  validCount: number;
  points: number | null;
  /** Full answer list, only once the round is scored. */
  answerKey: { answer: string; named: boolean }[] | null;
}

export interface SoloAnswerResponse {
  submittedAnswer: string;
  canonicalAnswer: string | null;
  isValid: boolean;
  isDuplicate: boolean;
  corrected: boolean;
  validCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  universityName: string;
  stateName: string;
  totalPoints: number;
  roundsPlayed: number;
  bidsHit: number;
  isMe: boolean;
}

export interface LeaderboardResponse {
  scope: LeaderboardScope;
  title: string;
  totalPlayers: number;
  entries: LeaderboardEntry[];
  me: { rank: number; totalPoints: number } | null;
}
