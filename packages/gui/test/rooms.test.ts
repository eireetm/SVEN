import { describe, expect, it } from "vitest";
import type { PeerLink } from "../src/net/link";
import { LOCAL_NETWORK } from "../src/net/local-network";
import { SPECTATOR_SEATS, type JoinAs, type NetMessage } from "../src/net/messages";
import { meet, type Admission, type Meeting } from "../src/net/rooms";

// Meeting in a room: a program joining says which seat it wants; the host takes in the other player and up
// to two spectators (those who come before the other player wait), refuses the rest, and stays in the room. Here the
// programs meet on the tests' local network (a BroadcastChannel in this process) instead of the public relays.

const until = async (check: () => boolean, ms = 3000): Promise<void> => {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error("timed out");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

/** A program in the room: its links, what each brought, whether the host turned it away. */
function program(code: string, role: "host" | JoinAs) {
  const links: { link: PeerLink; as: JoinAs; got: NetMessage[]; closed: boolean }[] = [];
  let full = false;
  const players = () => links.filter((l) => l.as === "player" && !l.closed).length;
  const watchers = () => links.filter((l) => l.as === "watch" && !l.closed).length;
  const admit = (as: JoinAs): Admission => (as === "player" ? (players() > 0 ? "full" : "yes") : watchers() < SPECTATOR_SEATS ? "yes" : "full");
  const meeting: Meeting = meet(
    code,
    role,
    null,
    {
      onLink: (link, as) => {
        const entry = { link, as, got: [] as NetMessage[], closed: false };
        link.onMessage = (m) => entry.got.push(m);
        link.onClose = () => {
          entry.closed = true;
        };
        links.push(entry);
      },
      onFull: () => {
        full = true;
      },
      admit,
    },
    undefined,
    [LOCAL_NETWORK],
  );
  return { links, meeting, isFull: () => full, players, watchers };
}

describe("rooms: the other player's seat and the spectators'", () => {
  it("the host takes in the other player, then up to two spectators, and refuses the rest", async () => {
    const code = `R${Math.random().toString(36).slice(2, 8)}`;
    const host = program(code, "host");
    // A spectator before the other player waits: the network isn't chosen yet.
    const early = program(code, "watch");
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(host.links).toHaveLength(0);
    expect(early.links).toHaveLength(0);
    const guest = program(code, "player");
    await until(() => host.players() === 1 && guest.links.length === 1);
    // Once the other player is in, the spectator who waited is taken in too.
    await until(() => host.watchers() === 1 && early.links.length === 1);
    const late = program(code, "watch");
    await until(() => host.watchers() === 2 && late.links.length === 1);
    const third = program(code, "watch");
    const second = program(code, "player");
    await until(() => third.isFull() && second.isFull());
    expect(host.watchers()).toBe(2);
    expect(host.players()).toBe(1);

    // Each link carries messages both ways, to its own program only.
    host.links.find((l) => l.as === "player")!.link.send({ t: "chat", text: "to the guest" });
    host.links.filter((l) => l.as === "watch").forEach((l) => l.link.send({ t: "watchers", n: 2 }));
    guest.links[0]!.link.send({ t: "chat", text: "to the host" });
    await until(() => guest.links[0]!.got.length === 1 && early.links[0]!.got.length === 1 && late.links[0]!.got.length === 1);
    await until(() => host.links.find((l) => l.as === "player")!.got.length === 1);
    expect(guest.links[0]!.got).toEqual([{ t: "chat", text: "to the guest" }]);
    expect(early.links[0]!.got).toEqual([{ t: "watchers", n: 2 }]);

    // The other player leaves: the host stays in the room with its spectators, and takes the next player in.
    guest.links[0]!.link.close();
    await until(() => host.players() === 0);
    expect(host.watchers()).toBe(2);
    const again = program(code, "player");
    await until(() => host.players() === 1 && again.links.length === 1);
    for (const p of [host, early, late, third, second, again]) p.meeting.cancel();
  });

  it("a program that joins again (its old connection not noticed gone yet) is taken in afresh", async () => {
    const code = `R${Math.random().toString(36).slice(2, 8)}`;
    const host = program(code, "host");
    const guest = program(code, "player");
    await until(() => host.players() === 1 && guest.links.length === 1);
    const first = host.links[0]!;
    // The same program asks again on the same channel (as after a lost connection): the old link closes, a new one opens.
    guest.links[0]!.link.send({ t: "join", as: "player" });
    await until(() => first.closed && host.players() === 1 && host.links.length === 2);
    for (const p of [host, guest]) p.meeting.cancel();
  });
});
