// A network for tests (docs/online.md "测试"): programs in one browser (pages of one browser context), or in one Node
// process, meet in a room through a BroadcastChannel instead of the public relays, and talk through it too (no WebRTC, no
// internet). It stands in for Trystero's rooms (rooms.ts) as far as they are used there. The app uses it only when the
// page's localStorage has "sve-test-network" = "local" (the end-to-end tests set it).
import type { JsonValue, MessageAction, Room } from "trystero";
import type { Network } from "./rooms";

/** What the members of a room post on its channel: who is there (to all, or answering a newcomer), who left, a message. */
type Post = { k: "here"; from: string; to?: string } | { k: "gone"; from: string } | { k: "msg"; from: string; to: string; action: string; data: unknown };

const newId = (): string => [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, "0")).join("");

/** Join room `code` of app `appId` on the local channel: the others there are met (onPeerJoin) and can be sent messages. */
function joinLocal(config: { appId: string }, code: string): Room {
  const self = newId();
  const channel = new BroadcastChannel(`sve-local-network:${config.appId}:${code}`);
  const peers = new Set<string>();
  const actions = new Map<string, MessageAction<JsonValue>>();
  let left = false;
  const room = {
    onPeerJoin: null as ((peerId: string) => void) | null,
    onPeerLeave: null as ((peerId: string) => void) | null,
    makeAction<T>(name: string): MessageAction<T & JsonValue> {
      const action: MessageAction<JsonValue> = {
        onMessage: null,
        onReceiveProgress: null,
        send: async (data, options) => {
          if (left) return;
          const target = options?.target;
          const to = target === undefined || target === null ? [...peers] : Array.isArray(target) ? target : [target];
          for (const peer of to) channel.postMessage({ k: "msg", from: self, to: peer, action: name, data } satisfies Post);
        },
      };
      actions.set(name, action);
      return action as MessageAction<T & JsonValue>;
    },
    getPeers: () => ({}),
    leave: async () => {
      if (left) return;
      left = true;
      channel.postMessage({ k: "gone", from: self } satisfies Post);
      channel.close();
    },
  };
  const meet = (peerId: string): void => {
    if (peers.has(peerId)) return;
    peers.add(peerId);
    room.onPeerJoin?.(peerId);
  };
  channel.onmessage = (event: { data: unknown }) => {
    const post = event.data as Post;
    if (left) return;
    if (post.k === "here") {
      if (post.to !== undefined && post.to !== self) return;
      // A newcomer: answer it, so it meets this member too.
      if (post.to === undefined) channel.postMessage({ k: "here", from: self, to: post.from } satisfies Post);
      meet(post.from);
    } else if (post.k === "gone") {
      if (peers.delete(post.from)) room.onPeerLeave?.(post.from);
    } else if (post.to === self && peers.has(post.from)) {
      void actions.get(post.action)?.onMessage?.(post.data as JsonValue, { peerId: post.from } as Parameters<NonNullable<MessageAction<JsonValue>["onMessage"]>>[1]);
    }
  };
  // Say it is here once the caller has set its handlers (rooms.ts sets them right after joining).
  setTimeout(() => {
    if (!left) channel.postMessage({ k: "here", from: self } satisfies Post);
  }, 0);
  return room as unknown as Room;
}

export const LOCAL_NETWORK: Network = { via: "local", join: joinLocal as unknown as Network["join"], relays: [] };

/** Whether this page uses the local test network instead of the public ones. */
export function localNetworkOn(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem("sve-test-network") === "local";
  } catch {
    return false;
  }
}
