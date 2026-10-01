// Where two players' programs find each other. No server of this project's: public services pass the few
// messages that set a connection up (signaling), and public STUN servers tell each program its address as seen from the
// internet. After that the two programs talk directly (WebRTC); a TURN relay (the player's own, in the settings) carries
// the connection only when a direct one can't be made.
//
// The lists were checked from a test machine on 2026-09-29: the connection library's own
// relays that answered, plus a relay in Japan and STUN servers in China, since players may be in different countries.

/**
 * Tells this program's rooms apart from other programs' on the same public relays (a new version of the protocol: a new id).
 * 2: programs say which seat they want when they join a room (spectators, online-3).
 */
export const APP_ID = "sve-evolve-gui-online-2";

/** Nostr relays (the library's default network; hundreds exist, these answered). */
export const NOSTR_RELAYS = [
  "bucket.coracle.social",
  "nostr-relay.corb.net",
  "nostr.islandarea.net",
  "purplerelay.com",
  "basspistol.org",
  "nos.lol",
  "nostr-01.yakihonne.com",
  "relay-can.zombi.cloudrodion.com",
  "yabu.me/v2",
].map((host) => `wss://${host}`);

/** Public MQTT brokers (over WebSocket); EMQX runs one for China. */
export const MQTT_BROKERS = ["broker.emqx.io:8084/mqtt", "broker-cn.emqx.io:8084/mqtt", "broker.hivemq.com:8884/mqtt", "test.mosquitto.org:8081/mqtt"].map(
  (host) => `wss://${host}`,
);

/** WebTorrent trackers. */
export const TORRENT_TRACKERS = ["open.ftorrent.com", "tracker.webtorrent.dev", "tracker.openwebtorrent.com"].map((host) => `wss://${host}`);

/** Public STUN servers, global and in China (each program asks all of them; one answer is enough). */
export const STUN_SERVERS = [
  "stun:stun.cloudflare.com:3478",
  "stun:stun.l.google.com:19302",
  "stun:global.stun.twilio.com:3478",
  "stun:stun.miwifi.com:3478",
  "stun:stun.chat.bilibili.com:3478",
];

/** A TURN relay the player set (settings): used when no direct connection can be made. */
export interface TurnServer {
  urls: string;
  username: string;
  credential: string;
}

/** An ICE server as WebRTC takes it (RTCIceServer; spelled out, so that no browser type is needed here). */
export interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

/** The ICE servers of a connection: the public STUN servers, and the player's TURN relay if any. */
export function iceServers(turn: TurnServer | null): IceServer[] {
  const servers: IceServer[] = [{ urls: STUN_SERVERS }];
  if (turn && turn.urls.trim() !== "") {
    servers.push({ urls: turn.urls.split(/[\s,]+/).filter(Boolean), username: turn.username, credential: turn.credential });
  }
  return servers;
}
