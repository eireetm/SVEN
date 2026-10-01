// A connection to the other player (docs/online.md): JSON messages both ways, and whether it is direct or goes through a TURN
// relay. Made from a public network's room (rooms.ts) or from codes passed by hand (manual.ts); the rest of the app sees
// only this.
import { parseMessage, type NetMessage } from "./messages";

/**
 * How the connection was set up: the public network whose relays passed its setup messages, codes passed by hand, or the
 * tests' channel in the browser (local-network.ts).
 */
export type Via = "nostr" | "mqtt" | "torrent" | "manual" | "local";

/** Direct between the two programs, or through a TURN relay (unknown until the connection's stats say). */
export type Route = "direct" | "relay" | "unknown";

export interface PeerLink {
  readonly via: Via;
  send(message: NetMessage): void;
  /** Messages from the other side. */
  onMessage: ((message: NetMessage) => void) | null;
  /** The connection is gone: the other side left, or the network dropped it. */
  onClose: (() => void) | null;
  route(): Promise<Route>;
  close(): void;
}

/** Direct or relayed: the types of the candidates of the connection's selected candidate pair (WebRTC statistics). */
export async function routeOf(pc: RTCPeerConnection | undefined): Promise<Route> {
  if (!pc) return "unknown";
  try {
    const stats = await pc.getStats();
    let pairId: string | undefined;
    stats.forEach((s: { type: string; selectedCandidatePairId?: string }) => {
      if (s.type === "transport" && s.selectedCandidatePairId) pairId = s.selectedCandidatePairId;
    });
    let pair: { localCandidateId?: string; remoteCandidateId?: string } | undefined;
    stats.forEach((s: { type: string; id: string; nominated?: boolean; state?: string; localCandidateId?: string; remoteCandidateId?: string }) => {
      if (s.type === "candidate-pair" && (pairId ? s.id === pairId : s.nominated && s.state === "succeeded")) pair = s;
    });
    if (!pair) return "unknown";
    const type = (id?: string) => (id ? (stats.get(id) as { candidateType?: string } | undefined)?.candidateType : undefined);
    return type(pair.localCandidateId) === "relay" || type(pair.remoteCandidateId) === "relay" ? "relay" : "direct";
  } catch {
    return "unknown";
  }
}

const json = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/** A link over a data channel of our own peer connection (codes passed by hand). */
export function channelLink(pc: RTCPeerConnection, channel: RTCDataChannel, via: Via): PeerLink {
  let closed = false;
  const link: PeerLink = {
    via,
    onMessage: null,
    onClose: null,
    send: (message) => {
      if (channel.readyState === "open") channel.send(JSON.stringify(message));
    },
    route: () => routeOf(pc),
    close: () => {
      closed = true;
      channel.close();
      pc.close();
    },
  };
  const gone = () => {
    if (closed) return;
    closed = true;
    link.onClose?.();
  };
  channel.onmessage = (e: MessageEvent) => {
    const message = typeof e.data === "string" ? parseMessage(json(e.data)) : null;
    if (message) link.onMessage?.(message);
  };
  channel.onclose = gone;
  // "disconnected" may come back; "failed" doesn't.
  pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") gone();
  });
  return link;
}
