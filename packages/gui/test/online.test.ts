import { describe, expect, it } from "vitest";
import { decodeSignal, encodeSignal, newRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from "../src/net/codes";
import { parseMessage } from "../src/net/messages";
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
    expect(parseMessage({ t: "hello", version: "online-1", cards: "abc" })).toEqual({ t: "hello", version: "online-1", cards: "abc" });
    expect(parseMessage({ t: "chat", text: "x".repeat(900) })).toEqual({ t: "chat", text: "x".repeat(500) });
    expect(parseMessage({ t: "ping", n: 3 })).toEqual({ t: "ping", n: 3 });
    expect(parseMessage({ t: "select", extra: 1 })).toEqual({ t: "select" });
    for (const bad of [null, "hi", 3, { t: "chat" }, { t: "ping", n: "3" }, { t: "hello", version: 1 }, { t: "unknown" }]) expect(parseMessage(bad)).toBeNull();
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
