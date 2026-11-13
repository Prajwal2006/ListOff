"use client";

/**
 * Browser persistence for session tokens so a refresh or dropped connection rejoins the same seat.
 * Every access is guarded: private windows and blocked storage must never crash the game.
 */
const PLAYER_KEY = (code: string) => `listoff:player:${code.toUpperCase()}`;
const HOST_KEY = (code: string) => `listoff:host:${code.toUpperCase()}`;
const HOSTED_LIST = "listoff:hosted";
const LAST_NAME = "listoff:name";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — session will last for this tab only */
  }
}
function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export interface PlayerSession {
  token: string;
  participantId: string;
  displayName: string;
}

export function parsePlayer(raw: string | null): PlayerSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlayerSession;
  } catch {
    return null;
  }
}

export const sessionStore = {
  playerRaw(code: string): string | null {
    return read(PLAYER_KEY(code));
  },
  hostedRaw(): string {
    return read(HOSTED_LIST) ?? "[]";
  },
  getPlayer(code: string): PlayerSession | null {
    const raw = read(PLAYER_KEY(code));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PlayerSession;
    } catch {
      return null;
    }
  },
  setPlayer(code: string, s: PlayerSession) {
    write(PLAYER_KEY(code), JSON.stringify(s));
    write(LAST_NAME, s.displayName);
  },
  clearPlayer(code: string) {
    remove(PLAYER_KEY(code));
  },
  getHost(code: string): string | null {
    return read(HOST_KEY(code));
  },
  setHost(code: string, token: string, name: string) {
    write(HOST_KEY(code), token);
    const list = this.hostedGames().filter((g) => g.code !== code.toUpperCase());
    list.unshift({ code: code.toUpperCase(), name, createdAt: Date.now() });
    write(HOSTED_LIST, JSON.stringify(list.slice(0, 30)));
  },
  hostedGames(): { code: string; name: string; createdAt: number }[] {
    try {
      return JSON.parse(read(HOSTED_LIST) ?? "[]");
    } catch {
      return [];
    }
  },
  lastName(): string {
    return read(LAST_NAME) ?? "";
  },
};
