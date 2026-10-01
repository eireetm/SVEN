// The codes people pass each other to connect: a short room code for the public relays, and — without any
// relay — a connection code (one program's WebRTC offer) and a reply code (the other's answer). Pure (tests run them).

/** Room codes: 6 characters people can read out, without 0/O, 1/I/L. */
const ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 6;

/** A new room code from random bytes (crypto.getRandomValues in the app). */
export function newRoomCode(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  return [...random(ROOM_CODE_LENGTH)].map((b) => ROOM_ALPHABET[b % ROOM_ALPHABET.length]).join("");
}

/** A room code as typed ("k7q m2x", "K7Q-M2X"): upper case, without spaces and dashes; null when it can't be one. */
export function normalizeRoomCode(text: string): string | null {
  const code = text.toUpperCase().replace(/[\s-]/g, "");
  return code.length === ROOM_CODE_LENGTH && [...code].every((c) => ROOM_ALPHABET.includes(c)) ? code : null;
}

/** "SVE1-O-..." (an offer) or "SVE1-A-..." (an answer): the session description, compressed. */
const PREFIX = "SVE1-";

export type SignalKind = "offer" | "answer";

function toBase64Url(bytes: Uint8Array): string {
  let text = "";
  for (const b of bytes) text += String.fromCharCode(b);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  // A copy with its own ArrayBuffer: what a Blob takes.
  const own = new Uint8Array(bytes.byteLength);
  own.set(bytes);
  const out = new Response(new Blob([own]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

/** A connection code (an offer) or a reply code (an answer) for a session description. */
export async function encodeSignal(kind: SignalKind, sdp: string): Promise<string> {
  const packed = await pipe(new TextEncoder().encode(sdp), new CompressionStream("deflate-raw"));
  return `${PREFIX}${kind === "offer" ? "O" : "A"}-${toBase64Url(packed)}`;
}

/** The session description in a code, if it is one of this kind (spaces and line breaks from chat apps are ignored). */
export async function decodeSignal(kind: SignalKind, code: string): Promise<string | null> {
  const text = code.replace(/\s/g, "");
  const head = `${PREFIX}${kind === "offer" ? "O" : "A"}-`;
  if (!text.startsWith(head)) return null;
  try {
    const sdp = new TextDecoder().decode(await pipe(fromBase64Url(text.slice(head.length)), new DecompressionStream("deflate-raw")));
    return sdp.startsWith("v=0") ? sdp : null;
  } catch {
    return null;
  }
}
