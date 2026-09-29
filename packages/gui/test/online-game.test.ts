import { describe, expect, it } from "vitest";
import { createEngine, randomAnswer, seedRng, type RngState } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GameHost } from "../src/engine/game-host";
import type { FromWorker, GameOptions, GameUpdate } from "../src/engine/protocol";
import { parseDeckFile, toDeckList } from "../src/decks/format";

// Online play (docs/online.md): two programs play the same game, each with its person's seat; only answers go between them,
// each with the sender's state before it. Here two worker hosts are joined by an in-memory network.

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const deck = (name: string) => toDeckList(parseDeckFile(JSON.parse(readFileSync(join(__dirname, "..", "decks", "samples", `${name}.json`), "utf8"))));

interface Side {
  host: GameHost;
  messages: FromWorker[];
  last: () => GameUpdate;
  /** Answers not yet sent to the other side. */
  outbox: Extract<FromWorker, { kind: "localInput" }>[];
  rng: RngState;
}

function side(seat: 0 | 1, options: GameOptions, announce: boolean): Side {
  const messages: FromWorker[] = [];
  const outbox: Side["outbox"] = [];
  const host = new GameHost(
    engine,
    (m) => {
      messages.push(m);
      if (m.kind === "localInput") outbox.push(m);
    },
    { schedule: () => () => undefined },
  );
  host.handle({ kind: "settings", settings: { botDelayMs: 0, attackPauseMs: 0, announceQuick: announce } });
  const controllers: GameOptions["controllers"] = seat === 0 ? ["human", "remote"] : ["remote", "human"];
  host.handle({ kind: "start", options: { ...options, controllers } });
  const last = () => (messages.filter((m) => m.kind === "update").at(-1) as { update: GameUpdate }).update;
  return { host, messages, last, outbox, rng: seedRng(`${options.seed}:${seat}`) };
}

const options = (seed: string, a = "sd03", b = "sd01"): GameOptions => ({
  seed,
  decks: [deck(a), deck(b)],
  deckNames: [a, b],
  controllers: ["human", "remote"],
  deckRestrictions: true,
  showEveryMainPhase: true,
  askEveryQuickWindow: true,
});

/** Deliver one side's answers to the other (all of them, or the first `n`). */
function deliver(from: Side, to: Side, n = Infinity): void {
  const batch = from.outbox.splice(0, Math.min(n, from.outbox.length));
  for (const m of batch) to.host.handle({ kind: "remoteInput", index: m.index, input: m.input, hash: m.hash });
}

/** Each person answers their own decisions at random (and sees each announcement); `hold`: messages wait that many steps. */
function play(a: Side, b: Side, hold = 0, steps = 6000): void {
  let held = 0;
  for (let step = 0; step < steps; step++) {
    let acted = false;
    for (const s of [a, b]) {
      const update = s.last();
      if (update.result || update.online?.desync) continue;
      if (update.announcement) {
        s.host.handle({ kind: "acknowledge", seq: update.announcement.seq });
        acted = true;
      } else if (update.decision) {
        s.host.handle({ kind: "answer", seat: update.decision.decision.player, answer: randomAnswer(s.rng, update.decision.decision) });
        acted = true;
      }
    }
    if (++held > hold || !acted) {
      held = 0;
      deliver(a, b);
      deliver(b, a);
    }
    if ((a.last().result && b.last().result) || a.last().online?.desync || b.last().online?.desync) return;
  }
}

describe("online play: two programs, one game", () => {
  it("plays the same game on both sides to the same end, only answers going between them", () => {
    for (const [seed, announce] of [["online-1", false], ["online-2", true], ["online-3", true]] as const) {
      const a = side(0, options(seed), announce);
      const b = side(1, options(seed), announce);
      // Each side is told whose seat is the other program's; nobody is asked the other's decisions.
      expect(a.last().online).toEqual({ seat: 0, remote: 1, desync: null });
      expect(b.last().online).toEqual({ seat: 1, remote: 0, desync: null });
      play(a, b);
      expect(a.last().result).not.toBeNull();
      expect(b.last().result).toEqual(a.last().result);
      expect(JSON.stringify(b.host.session!.state)).toBe(JSON.stringify(a.host.session!.state));
      expect(b.host.replay()!.inputs).toEqual(a.host.replay()!.inputs);
      expect([a, b].flatMap((s) => s.messages.filter((m) => m.kind === "error"))).toEqual([]);
    }
  });

  it("waits for answers that come late and in batches", () => {
    const a = side(0, options("online-late", "sd02", "sd03"), true);
    const b = side(1, options("online-late", "sd02", "sd03"), true);
    play(a, b, 5);
    expect(a.last().result).not.toBeNull();
    expect(JSON.stringify(b.host.session!.state)).toBe(JSON.stringify(a.host.session!.state));
  });

  it("ignores an answer it has played already (sent again after reconnecting)", () => {
    const a = side(0, options("online-again"), false);
    const b = side(1, options("online-again"), false);
    play(a, b, 0, 40);
    const sent = a.messages.filter((m): m is Extract<FromWorker, { kind: "localInput" }> => m.kind === "localInput");
    expect(sent.length).toBeGreaterThan(0);
    for (const m of sent) b.host.handle({ kind: "remoteInput", index: m.index, input: m.input, hash: m.hash });
    expect(b.last().online?.desync).toBeNull();
    play(a, b);
    expect(JSON.stringify(b.host.session!.state)).toBe(JSON.stringify(a.host.session!.state));
  });

  it("stops when the two games differ, and tells at which answer", () => {
    const a = side(0, options("online-desync"), false);
    const b = side(1, options("online-desync"), false);
    play(a, b, 0, 30);
    // An answer whose sender had another state: the receiver stops there.
    for (let i = 0; i < 200 && a.outbox.length === 0; i++) {
      const update = a.last();
      if (update.decision) a.host.handle({ kind: "answer", seat: 0, answer: randomAnswer(a.rng, update.decision.decision) });
      else deliver(b, a);
      if (update.decision === null && b.last().decision) b.host.handle({ kind: "answer", seat: 1, answer: randomAnswer(b.rng, b.last().decision!.decision) });
    }
    const [first] = a.outbox.splice(0, 1);
    b.host.handle({ kind: "remoteInput", index: first!.index, input: first!.input, hash: "00000000-0" });
    expect(b.last().online?.desync).toBe(`${first!.index + 1}`);
    // Nothing more is played or asked there.
    expect(b.last().decision === null || b.last().decision!.decision.player === 1).toBe(true);
  });

  it("shows only this person's hidden cards, whatever the debug settings say; takes no answer back", () => {
    const a = side(0, options("online-hidden"), false);
    const b = side(1, options("online-hidden"), false);
    play(a, b, 0, 12);
    a.host.handle({ kind: "settings", settings: { revealAll: true } });
    const update = a.last();
    expect(update.view.players[1].hand.length).toBeGreaterThan(0);
    expect(update.view.players[1].hand.every((c) => c.hidden)).toBe(true);
    expect(update.view.players[0].hand.some((c) => !c.hidden)).toBe(true);
    // The other seat's answers aren't this person's to take back.
    expect(update.humanInputs.every((i) => a.host.replay()!.inputs[i]!.by === 0)).toBe(true);
    const inputs = update.inputCount;
    a.host.handle({ kind: "rewind", inputs: 0 });
    expect(a.last().inputCount).toBe(inputs);
  });

  it("an online game's replay goes on at one screen, a person at each seat", () => {
    const a = side(0, options("online-replay"), false);
    const b = side(1, options("online-replay"), false);
    play(a, b, 0, 30);
    const replay = a.host.replay()!;
    expect(replay.options.controllers).toEqual(["human", "remote"]);
    const messages: FromWorker[] = [];
    const local = new GameHost(engine, (m) => messages.push(m), { schedule: () => () => undefined });
    local.handle({ kind: "loadReplay", replay });
    const update = (messages.filter((m) => m.kind === "update").at(-1) as { update: GameUpdate }).update;
    expect(update.controllers).toEqual(["human", "human"]);
    expect(update.online).toBeNull();
    expect(JSON.stringify(local.session!.state)).toBe(JSON.stringify(a.host.session!.state));
    expect(update.decision).not.toBeNull();
  });

  it("a player who concedes loses on both sides at once", () => {
    const a = side(0, options("online-concede"), false);
    const b = side(1, options("online-concede"), false);
    play(a, b, 0, 20);
    b.host.handle({ kind: "concede", seat: 1 });
    deliver(b, a);
    expect(a.last().result).toEqual({ winner: 0, losses: [{ player: 1, reason: "concede" }] });
    expect(b.last().result).toEqual(a.last().result);
    // The other program's seat can't be conceded from here.
    const c = side(0, options("online-concede-2"), false);
    c.host.handle({ kind: "concede", seat: 1 });
    expect(c.last().result).toBeNull();
  });
});
