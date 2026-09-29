// Meeting in a room (docs/online.md): both programs join room <code> on three public networks at once — Nostr, MQTT and
// BitTorrent trackers — through the Trystero library, which passes the WebRTC setup messages through the networks' relays,
// encrypted with the room code. Whichever network connects the two first is used: the host takes the first connection that
// opens and says so on it ("select"); the guest takes the one the host selected; both leave the other networks. A
// network whose relays can't be reached from one side simply never connects.
import { joinRoom as joinNostr, type JsonValue, type MessageAction, type Room } from "trystero";
import { joinRoom as joinMqtt } from "@trystero-p2p/mqtt";
import { joinRoom as joinTorrent } from "@trystero-p2p/torrent";
import { routeOf, type PeerLink, type Via } from "./link";
import { parseMessage, type NetMessage } from "./messages";
import { APP_ID, iceServers, MQTT_BROKERS, NOSTR_RELAYS, TORRENT_TRACKERS, type TurnServer } from "./relays";

type Join = typeof joinNostr;

const NETWORKS: { via: Via; join: Join; relays: string[] }[] = [
  { via: "nostr", join: joinNostr, relays: NOSTR_RELAYS },
  { via: "mqtt", join: joinMqtt as Join, relays: MQTT_BROKERS },
  { via: "torrent", join: joinTorrent as Join, relays: TORRENT_TRACKERS },
];

export interface Meeting {
  /** Stop looking (and leave every network). */
  cancel(): void;
}

export interface MeetingHandlers {
  /** Connected to the other player. */
  onLink: (link: PeerLink) => void;
  /** Joining: the host has a guest already. */
  onFull: () => void;
}

/** The public networks rooms can meet on. */
export const NETWORK_IDS: Via[] = NETWORKS.map((n) => n.via);

/** Meet the other player in room `code`, as its host (who made the code) or as a guest; on `only` these networks (tests). */
export function meet(code: string, role: "host" | "guest", turn: TurnServer | null, handlers: MeetingHandlers, only?: readonly Via[]): Meeting {
  let chosen = false;
  const rooms: Room[] = [];
  const leaveOthers = (keep?: Room) => {
    for (const room of rooms) if (room !== keep) void room.leave().catch(() => undefined);
  };
  for (const network of NETWORKS) {
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
    rooms.push(room);
    const action = room.makeAction<JsonValue>("sve");
    // The host says "select" before anything else: the guest drops what comes before it (it is still choosing).
    const adopt = (peerId: string, select: boolean): void => {
      chosen = true;
      leaveOthers(room);
      const link = roomLink(room, action, peerId, network.via);
      if (select) link.send({ t: "select" });
      handlers.onLink(link);
    };
    room.onPeerJoin = (peerId) => {
      if (role !== "host") return;
      if (chosen) {
        void action.send({ t: "full" } satisfies NetMessage, { target: peerId }).catch(() => undefined);
        return;
      }
      adopt(peerId, true);
    };
    action.onMessage = (data, context) => {
      if (role !== "guest" || chosen) return;
      const message = parseMessage(data);
      if (message?.t === "select") adopt(context.peerId, false);
      else if (message?.t === "full") handlers.onFull();
    };
  }
  return {
    cancel: () => {
      chosen = true;
      leaveOthers();
    },
  };
}

/** A link to one peer of a room, over its "sve" action. */
function roomLink(room: Room, action: MessageAction<JsonValue>, peerId: string, via: Via): PeerLink {
  let closed = false;
  const link: PeerLink = {
    via,
    onMessage: null,
    onClose: null,
    send: (message) => {
      void action.send(message as unknown as JsonValue, { target: peerId }).catch(() => undefined);
    },
    route: () => routeOf(room.getPeers()[peerId]),
    close: () => {
      closed = true;
      void room.leave().catch(() => undefined);
    },
  };
  action.onMessage = (data, context) => {
    if (context.peerId !== peerId) return;
    const message = parseMessage(data);
    if (message) link.onMessage?.(message);
  };
  room.onPeerLeave = (id) => {
    if (id !== peerId || closed) return;
    closed = true;
    link.onClose?.();
  };
  return link;
}
