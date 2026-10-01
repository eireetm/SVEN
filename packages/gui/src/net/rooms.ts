// Meeting in a room: the programs join room <code> on three public networks at once — Nostr, MQTT and
// BitTorrent trackers — through the Trystero library, which passes the WebRTC setup messages through the networks' relays,
// encrypted with the room code. A program joining says which seat it wants ("join": the other player's, or a spectator's)
// to each program it meets there; only the host answers: it takes it in ("select") or has no such seat left ("full"). The
// first one the host takes in fixes the network: the host leaves the others (a spectator who comes before the other player
// waits for that). The host stays in the room while it is connected, so spectators can come later and the other player
// can come back after a lost connection. A network whose relays can't be reached from one side simply never connects.
import { joinRoom as joinNostr, type JsonValue, type MessageAction, type Room } from "trystero";
import { joinRoom as joinMqtt } from "@trystero-p2p/mqtt";
import { joinRoom as joinTorrent } from "@trystero-p2p/torrent";
import { routeOf, type PeerLink, type Via } from "./link";
import { LOCAL_NETWORK, localNetworkOn } from "./local-network";
import { parseMessage, type JoinAs, type NetMessage } from "./messages";
import { APP_ID, iceServers, MQTT_BROKERS, NOSTR_RELAYS, TORRENT_TRACKERS, type TurnServer } from "./relays";

type Join = typeof joinNostr;

/** A public network rooms can meet on (tests give their own). */
export interface Network {
  via: Via;
  join: Join;
  relays: string[];
}

const NETWORKS: Network[] = [
  { via: "nostr", join: joinNostr, relays: NOSTR_RELAYS },
  { via: "mqtt", join: joinMqtt as Join, relays: MQTT_BROKERS },
  { via: "torrent", join: joinTorrent as Join, relays: TORRENT_TRACKERS },
];

export interface Meeting {
  /** Stop looking, or leave the room (and every network): the connections made in it close. */
  cancel(): void;
}

/** The host's answer to a program asking for a seat: take it in now, later, or not at all. */
export type Admission = "yes" | "wait" | "full";

export interface MeetingHandlers {
  /** Connected: a joining program to the host; the host to a program it took in (`as`: the seat that program asked for). */
  onLink: (link: PeerLink, as: JoinAs) => void;
  /** Joining: the host has no seat of the kind asked for. */
  onFull: () => void;
  /** The host: whether it takes in a program asking for this seat (asked again, after each one taken in, for those told to wait). */
  admit?: (as: JoinAs) => Admission;
}

/** The public networks rooms can meet on. */
export const NETWORK_IDS: Via[] = NETWORKS.map((n) => n.via);

/** A room of a meeting: its action, and the connections made in it (by the other program's peer id). */
interface RoomState {
  room: Room;
  via: Via;
  action: MessageAction<JsonValue>;
  links: Map<string, RoomLink>;
  /** Programs the host told to wait, and the seat each asked for. */
  waiting: Map<string, JoinAs>;
}

/**
 * Meet in room `code`: as its host (who made the code), or joining it as the other player or a spectator; on `only` these
 * networks, or on `networks` (tests).
 */
export function meet(
  code: string,
  role: "host" | JoinAs,
  turn: TurnServer | null,
  handlers: MeetingHandlers,
  only?: readonly Via[],
  networks: readonly Network[] = NETWORKS,
): Meeting {
  const host = role === "host";
  /** The room the host chose (or the one a joining program was taken in). */
  let chosen: RoomState | null = null;
  let over = false;
  const rooms: RoomState[] = [];
  const leaveOthers = (keep?: RoomState) => {
    for (const r of rooms) if (r !== keep) void r.room.leave().catch(() => undefined);
  };
  const cancel = () => {
    over = true;
    leaveOthers();
  };
  const send = (r: RoomState, message: NetMessage, peerId: string) =>
    void r.action.send(message as unknown as JsonValue, { target: peerId }).catch(() => undefined);
  const adopt = (r: RoomState, peerId: string, as: JoinAs): void => {
    if (!chosen) {
      chosen = r;
      leaveOthers(r);
    }
    r.waiting.delete(peerId);
    const link = roomLink(r, peerId, () => {
      r.links.delete(peerId);
      // A joining program leaves the room with its connection. The host stays for the others, and closes this one's
      // connection for good (one that only stopped answering would keep it as "met", and its program couldn't come back).
      if (!host) cancel();
      else {
        try {
          r.room.getPeers()[peerId]?.close();
        } catch {
          // gone already
        }
      }
    });
    r.links.set(peerId, link);
    if (host) send(r, { t: "select" }, peerId);
    handlers.onLink(link, as);
  };
  /** The host: an answer for a program asking for a seat (the spectators wait until the network is chosen). */
  const admission = (r: RoomState, as: JoinAs): Admission => {
    if (chosen && chosen !== r) return "full";
    if (!chosen && as === "watch") return "wait";
    return handlers.admit?.(as) ?? "yes";
  };
  /** The host: the programs told to wait, asked again (after each one taken in). */
  const admitWaiting = (): void => {
    const r = chosen;
    if (!r) return;
    for (const [peerId, as] of [...r.waiting]) {
      const answer = admission(r, as);
      if (answer === "wait") continue;
      r.waiting.delete(peerId);
      if (answer === "full") send(r, { t: "full" }, peerId);
      else adopt(r, peerId, as);
    }
  };
  // The end-to-end tests meet on a channel of the browser instead (local-network.ts).
  for (const network of localNetworkOn() && networks === NETWORKS ? [LOCAL_NETWORK] : networks) {
    if (only && !only.includes(network.via)) continue;
    let room: Room;
    try {
      room = network.join(
        { appId: APP_ID, password: code, rtcConfig: { iceServers: iceServers(turn) }, relayConfig: { urls: network.relays, warnOnRelayFailure: false } },
        code,
      );
    } catch {
      continue; // this network can't be used here (e.g. no WebSocket to it): the others may
    }
    const r: RoomState = { room, via: network.via, action: room.makeAction<JsonValue>("sve"), links: new Map(), waiting: new Map() };
    rooms.push(r);
    room.onPeerJoin = (peerId) => {
      // Joining: say which seat this program wants to whoever is there (the host answers; the others ignore it).
      if (!host && !chosen && !over) send(r, { t: "join", as: role }, peerId);
    };
    room.onPeerLeave = (peerId) => {
      r.waiting.delete(peerId);
      r.links.get(peerId)?.gone();
    };
    r.action.onMessage = (data, context) => {
      const message = parseMessage(data);
      if (!message || over) return;
      const peerId = context.peerId;
      const link = r.links.get(peerId);
      if (link) {
        // A program that joins again (after losing its connection) starts over: its old connection is gone.
        if (!(host && message.t === "join")) return link.deliver(message);
        link.gone();
      }
      if (host) {
        if (message.t !== "join") return;
        const answer = admission(r, message.as);
        if (answer === "full") return send(r, { t: "full" }, peerId);
        if (answer === "wait") {
          r.waiting.set(peerId, message.as);
          return;
        }
        adopt(r, peerId, message.as);
        admitWaiting();
        return;
      }
      if (chosen) return;
      if (message.t === "select") adopt(r, peerId, role);
      else if (message.t === "full") handlers.onFull();
    };
  }
  return { cancel };
}

/** A link to one program of a room, over its "sve" action; the room hands it its messages and tells when it is gone. */
interface RoomLink extends PeerLink {
  deliver(message: NetMessage): void;
  gone(): void;
}

function roomLink(r: RoomState, peerId: string, closed: () => void): RoomLink {
  let done = false;
  const finish = (): boolean => {
    if (done) return false;
    done = true;
    closed();
    return true;
  };
  const link: RoomLink = {
    via: r.via,
    onMessage: null,
    onClose: null,
    send: (message) => {
      if (!done) void r.action.send(message as unknown as JsonValue, { target: peerId }).catch(() => undefined);
    },
    route: () => routeOf(r.room.getPeers()[peerId]),
    close: () => {
      finish();
    },
    deliver: (message) => {
      if (!done) link.onMessage?.(message);
    },
    gone: () => {
      if (finish()) link.onClose?.();
    },
  };
  return link;
}
