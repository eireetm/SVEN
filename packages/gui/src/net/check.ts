// "Check the network" (docs/online.md): what this computer can reach of what online play needs — the relays of each public
// network (a WebSocket opens), and the STUN servers (one tells this program its public address). When two players can't
// connect, each one's result tells what is missing on which side.
import type { Via } from "./link";
import { MQTT_BROKERS, NOSTR_RELAYS, STUN_SERVERS, TORRENT_TRACKERS } from "./relays";

export interface NetworkCheck {
  relays: { via: Exclude<Via, "manual">; reached: number; total: number }[];
  /** Each STUN server: whether it gave this program a public address. */
  stun: { url: string; ok: boolean }[];
}

/** A relay answers: its WebSocket opens within `ms`. */
function reach(url: string, protocols: string[] | undefined, ms = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    let socket: WebSocket;
    const done = (ok: boolean) => {
      window.clearTimeout(timer);
      try {
        socket.close();
      } catch {
        // already closed
      }
      resolve(ok);
    };
    const timer = window.setTimeout(() => done(false), ms);
    try {
      socket = new WebSocket(url, protocols);
    } catch {
      return done(false);
    }
    socket.onopen = () => done(true);
    socket.onerror = () => done(false);
  });
}

/** A STUN server gives this program its public address (a server-reflexive candidate) within `ms`. */
function stun(url: string, ms = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: [url] }] });
    const done = (ok: boolean) => {
      window.clearTimeout(timer);
      pc.close();
      resolve(ok);
    };
    const timer = window.setTimeout(() => done(false), ms);
    pc.onicecandidate = (e) => {
      if (e.candidate && / typ srflx /.test(e.candidate.candidate)) done(true);
    };
    pc.createDataChannel("check");
    void pc
      .createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => done(false));
  });
}

export async function checkNetwork(): Promise<NetworkCheck> {
  const networks = [
    { via: "nostr" as const, urls: NOSTR_RELAYS, protocols: undefined },
    { via: "mqtt" as const, urls: MQTT_BROKERS, protocols: ["mqtt"] },
    { via: "torrent" as const, urls: TORRENT_TRACKERS, protocols: undefined },
  ];
  const [relays, stunResults] = await Promise.all([
    Promise.all(
      networks.map(async (n) => ({
        via: n.via,
        reached: (await Promise.all(n.urls.map((url) => reach(url, n.protocols)))).filter(Boolean).length,
        total: n.urls.length,
      })),
    ),
    Promise.all(STUN_SERVERS.map(async (url) => ({ url, ok: await stun(url) }))),
  ]);
  return { relays, stun: stunResults };
}
