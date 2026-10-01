import { describe, expect, it } from "vitest";
import { decodeSignal, encodeSignal, newRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from "../src/net/codes";
import { BACKLOG_PIECE, parseMessage, watchedOptions, type WatchedGame } from "../src/net/messages";
import { iceServers, STUN_SERVERS } from "../src/net/relays";

// Online play (docs/online.md): the codes people pass each other, the messages two programs accept, the ICE servers.

const SDP = [
  "v=0",
  "o=- 4611731400430051336 2 IN IP4 127.0.0.1",
  "s=-",
  "t=0 0",
  "a=group:BUNDLE 0",
  "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
  "c=IN IP4 0.0.0.0",
  "a=candidate:1 1 udp 2122260223 192.168.1.20 54321 typ host generation 0",
  "a=candidate:2 1 udp 1686052607 203.0.113.7 54321 typ srflx raddr 192.168.1.20 rport 54321 generation 0",
  "a=ice-ufrag:abcd",
  "a=ice-pwd:0123456789abcdef0123456789",
  "a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
  "a=setup:actpass",
  "a=mid:0",
  "a=sctp-port:5000",
  "",
].join("\r\n");

describe("room codes", () => {
  it("are 6 characters people can read out, and typed ones are tidied up", () => {
    const code = newRoomCode(() => Uint8Array.from([0, 1, 2, 30, 31, 255]));
    expect(code).toHaveLength(ROOM_CODE_LENGTH);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    for (let i = 0; i < 50; i++) expect(newRoomCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/);
    expect(normalizeRoomCode(" k7q-m2x ")).toBe("K7QM2X");
    // O, I, L, 0, 1 are never in a code; a wrong length isn't one either.
    for (const bad of ["K7QM2O", "K7QM2I", "K7Q M21", "K7QM2", "K7QM2XX", ""]) expect(normalizeRoomCode(bad)).toBeNull();
  });
});

describe("connection codes (by hand)", () => {
  it("carry a session description both ways, compressed, and refuse other codes", async () => {
    const offer = await encodeSignal("offer", SDP);
    expect(offer.startsWith("SVE1-O-")).toBe(true);
    expect(offer.length).toBeLessThan(SDP.length);
    expect(await decodeSignal("offer", offer)).toBe(SDP);
    // Chat apps break long lines.
    expect(await decodeSignal("offer", offer.replace(/(.{40})/g, "$1\n  "))).toBe(SDP);
    const answer = await encodeSignal("answer", SDP);
    expect(answer.startsWith("SVE1-A-")).toBe(true);
    expect(await decodeSignal("offer", answer)).toBeNull();
    expect(await decodeSignal("answer", "SVE1-A-garbage!!")).toBeNull();
    expect(await decodeSignal("answer", "hello")).toBeNull();
  });
});

describe("messages", () => {
  it("accept only what the protocol says, trimmed to size", () => {
    expect(parseMessage({ t: "hello", version: "online-2", cards: "abc", engine: "def" })).toEqual({ t: "hello", version: "online-2", cards: "abc", engine: "def" });
    expect(parseMessage({ t: "chat", text: "x".repeat(900) })).toEqual({ t: "chat", text: "x".repeat(500) });
    expect(parseMessage({ t: "ping", n: 3 })).toEqual({ t: "ping", n: 3 });
    expect(parseMessage({ t: "select", extra: 1 })).toEqual({ t: "select" });
    for (const bad of [null, "hi", 3, { t: "chat" }, { t: "ping", n: "3" }, { t: "hello", version: 1 }, { t: "hello", version: "online-2", cards: "abc" }, { t: "unknown" }]) {
      expect(parseMessage(bad)).toBeNull();
    }
  });

  it("carry a game's preparation and answers, checked field by field", () => {
    const rules = { format: "crossCraft", list: "01_26_EN_CROSS", turnOrder: "random" };
    expect(parseMessage({ t: "rules", rules })).toEqual({ t: "rules", rules });
    expect(parseMessage({ t: "rules", rules: { ...rules, list: null } })).toEqual({ t: "rules", rules: { ...rules, list: null } });
    for (const bad of [{ ...rules, format: "modern" }, { ...rules, turnOrder: "me" }, { ...rules, list: 3 }, null]) expect(parseMessage({ t: "rules", rules: bad })).toBeNull();
    const deck = { name: "Mine", deck: { leader: "SD01-LD01", main: ["SD01-001", "SD01-001"], evolve: ["SD01-016"] }, leader2: null };
    expect(parseMessage({ t: "ready", deck })).toEqual({ t: "ready", deck });
    expect(parseMessage({ t: "ready", deck: null })).toEqual({ t: "ready", deck: null });
    // No leader (unlimited games may leave it out); a deck too big or of other things is refused.
    const { leader: _, ...leaderless } = deck.deck;
    expect(parseMessage({ t: "ready", deck: { ...deck, deck: leaderless } })).toEqual({ t: "ready", deck: { ...deck, deck: leaderless } });
    expect(parseMessage({ t: "ready", deck: { ...deck, deck: { ...deck.deck, main: Array(201).fill("SD01-001") } } })).toBeNull();
    expect(parseMessage({ t: "ready", deck: { ...deck, deck: { ...deck.deck, evolve: [7] } } })).toBeNull();
    expect(parseMessage({ t: "ready", deck: { ...deck, leader2: 7 } })).toBeNull();
    expect(parseMessage({ t: "commit", hash: "ab".repeat(32) })).toEqual({ t: "commit", hash: "ab".repeat(32) });
    expect(parseMessage({ t: "nonce", value: "cd" })).toEqual({ t: "nonce", value: "cd" });
    expect(parseMessage({ t: "start", secret: "ef" })).toEqual({ t: "start", secret: "ef" });
    expect(parseMessage({ t: "commit", hash: "x".repeat(200) })).toBeNull();
    const input = { type: "mainPhase", action: { type: "endMainPhase" } };
    expect(parseMessage({ t: "input", index: 12, input, hash: "0a1b2c3d-99" })).toEqual({ t: "input", index: 12, input, hash: "0a1b2c3d-99" });
    for (const bad of [
      { t: "input", index: -1, input, hash: "h" },
      { t: "input", index: 1.5, input, hash: "h" },
      { t: "input", index: 1, input: { action: 1 }, hash: "h" },
      { t: "input", index: 1, input: { type: "x", junk: "y".repeat(5000) }, hash: "h" },
      { t: "input", index: 1, input },
    ]) {
      expect(parseMessage(bad)).toBeNull();
    }
    expect(parseMessage({ t: "resume", game: "seed", have: 40 })).toEqual({ t: "resume", game: "seed", have: 40 });
    expect(parseMessage({ t: "resume", game: "seed", have: "40" })).toBeNull();
  });

  it("carry what spectators need: the seat asked for, the game watched and its inputs so far, the chat's speaker", () => {
    expect(parseMessage({ t: "join", as: "watch" })).toEqual({ t: "join", as: "watch" });
    expect(parseMessage({ t: "join", as: "player" })).toEqual({ t: "join", as: "player" });
    expect(parseMessage({ t: "join", as: "referee" })).toBeNull();
    expect(parseMessage({ t: "watchers", n: 2 })).toEqual({ t: "watchers", n: 2 });
    expect(parseMessage({ t: "watchers", n: 3 })).toBeNull();
    expect(parseMessage({ t: "chat", text: "gl", seat: 1 })).toEqual({ t: "chat", text: "gl", seat: 1 });
    expect(parseMessage({ t: "chat", text: "gl", seat: 2 })).toBeNull();
    const deck = { leader: "SD01-LD01", main: ["SD01-001"], evolve: [] };
    const game = {
      id: "seed",
      decks: [deck, deck],
      deckNames: ["A", "B"],
      deckRestrictions: true,
      format: "standard",
      restrictionList: null,
      secondLeaders: [null, null],
      turnOrder: "choose",
      backlog: 2,
    };
    expect(parseMessage({ t: "watch", game })).toEqual({ t: "watch", game });
    expect(parseMessage({ t: "watch", game: null })).toEqual({ t: "watch", game: null });
    for (const bad of [{ ...game, decks: [deck] }, { ...game, deckNames: ["A", 1] }, { ...game, format: "modern" }, { ...game, backlog: -1 }, { ...game, secondLeaders: [7, null] }]) {
      expect(parseMessage({ t: "watch", game: bad })).toBeNull();
    }
    // The options a spectator's engine plays it with: both seats the players' programs, the players' pacing.
    expect(watchedOptions(game as unknown as WatchedGame)).toMatchObject({ seed: "seed", controllers: ["remote", "remote"], showEveryMainPhase: true, askEveryQuickWindow: true, manualActions: false });
    const input = { type: "mainPhase", action: { type: "endMainPhase" } };
    expect(parseMessage({ t: "backlog", start: 0, inputs: [{ input, by: 0 }, { input: { type: "quick", action: { type: "pass" } }, by: null }] })).toEqual({
      t: "backlog",
      start: 0,
      inputs: [{ input, by: 0 }, { input: { type: "quick", action: { type: "pass" } }, by: null }],
    });
    expect(parseMessage({ t: "backlog", start: 0, inputs: [{ input, by: 2 }] })).toBeNull();
    expect(parseMessage({ t: "backlog", start: 0, inputs: Array(BACKLOG_PIECE + 1).fill({ input, by: 0 }) })).toBeNull();
  });
});

describe("ICE servers", () => {
  it("are the public STUN servers, and the player's TURN relay when set", () => {
    expect(iceServers(null)).toEqual([{ urls: STUN_SERVERS }]);
    expect(iceServers({ urls: " ", username: "", credential: "" })).toEqual([{ urls: STUN_SERVERS }]);
    expect(iceServers({ urls: "turn:a.example:3478 turns:a.example:5349", username: "u", credential: "p" })[1]).toEqual({
      urls: ["turn:a.example:3478", "turns:a.example:5349"],
      username: "u",
      credential: "p",
    });
  });
});
