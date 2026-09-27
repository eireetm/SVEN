import { describe, expect, it } from "vitest";
import { createEngine, randomAnswer, seedRng, type PlayerId } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GameHost, type Scheduler } from "../src/engine/game-host";
import type { FromWorker, GameOptions, GameUpdate, Replay, SeatController } from "../src/engine/protocol";
import { parseDeckFile, toDeckList } from "../src/decks/format";

// The engine worker's logic, run in Node with a manual scheduler (bots answer when the test lets them).
const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const deck = (name: string) => toDeckList(parseDeckFile(JSON.parse(readFileSync(join(__dirname, "..", "decks", "samples", `${name}.json`), "utf8"))));

class ManualScheduler implements Scheduler {
  private queue: (() => void)[] = [];
  schedule(fn: () => void): () => void {
    this.queue.push(fn);
    return () => (this.queue = this.queue.filter((f) => f !== fn));
  }
  /** Run scheduled bot answers until none is left (or `max`). */
  run(max = 5000): number {
    let n = 0;
    while (this.queue.length > 0 && n < max) {
      this.queue.shift()!();
      n += 1;
    }
    return n;
  }
}

function harness(controllers: [SeatController, SeatController], seed = "host-test") {
  const messages: FromWorker[] = [];
  const scheduler = new ManualScheduler();
  const host = new GameHost(engine, (m) => messages.push(m), scheduler);
  const options: GameOptions = { seed, decks: [deck("sd01"), deck("sd02")], deckNames: ["SD01", "SD02"], controllers, deckRestrictions: true };
  const last = (): GameUpdate => {
    const updates = messages.filter((m): m is Extract<FromWorker, { kind: "update" }> => m.kind === "update");
    return updates[updates.length - 1]!.update;
  };
  const errors = () => messages.filter((m) => m.kind === "error");
  return { host, scheduler, options, messages, last, errors };
}

describe("GameHost (engine worker logic)", () => {
  it("plays a game between two bots to the end, publishing views and the log", () => {
    const h = harness(["random", "random"]);
    h.host.handle({ kind: "start", options: h.options });
    h.scheduler.run();
    const update = h.last();
    expect(h.errors()).toEqual([]);
    expect(update.result).not.toBeNull();
    // Watching bots: both hands are visible.
    expect(update.view.players.every((side) => side.hand.every((c) => !c.hidden))).toBe(true);
    const logged = h.messages.flatMap((m) => (m.kind === "update" ? m.update.log : []));
    expect(logged.some((e) => e.event.type === "gameEnded")).toBe(true);
  });

  it("gives a person their decisions with the cards they name, and hides the opponent's hand", () => {
    const h = harness(["human", "random"]);
    h.host.handle({ kind: "start", options: h.options });
    h.scheduler.run();
    let update = h.last();
    const rng = seedRng("person");
    let answered = 0;
    while (!update.result && answered < 400) {
      if (update.decision) {
        expect(update.decision.decision.player).toBe(0);
        if (update.decision.decision.type === "mainPhase") {
          for (const a of update.decision.decision.actions) if (a.type === "play") expect(update.decision.cards[a.card]).toBeDefined();
        }
        h.host.handle({ kind: "answer", seat: 0, answer: randomAnswer(rng, update.decision.decision) });
        answered += 1;
      }
      h.scheduler.run();
      update = h.last();
      expect(update.perspective).toBe(0);
      expect(update.view.players[1].hand.every((c) => c.hidden)).toBe(true);
    }
    expect(h.errors()).toEqual([]);
    expect(update.result).not.toBeNull();
    expect(update.humanInputs.length).toBe(answered);
  });

  it("refuses an answer from the wrong seat and an illegal answer without changing the game", () => {
    const h = harness(["human", "human"]);
    h.host.handle({ kind: "start", options: h.options });
    const update = h.last();
    const seat = update.decision!.decision.player;
    const other = (1 - seat) as PlayerId;
    h.host.handle({ kind: "answer", seat: other, answer: { type: "chooseTurnOrder", goFirst: true } });
    h.host.handle({ kind: "answer", seat, answer: { type: "confirm", yes: true } });
    expect(h.errors().length).toBe(2);
    expect(h.last().inputCount).toBe(0);
  });

  it("rewinds to an earlier input and loads replays, reproducing the same game exactly", () => {
    const h = harness(["random", "random"], "rewind");
    h.host.handle({ kind: "start", options: h.options });
    h.scheduler.run(15);
    const at = h.last().inputCount;
    const state = JSON.stringify(h.host.session!.state);
    const replay = h.host.replay()!;
    h.scheduler.run(15);
    expect(h.last().inputCount).toBeGreaterThan(at);
    // Pause the bots, go back, compare.
    h.host.handle({ kind: "settings", settings: { paused: true } });
    h.host.handle({ kind: "rewind", inputs: at });
    expect(h.last().inputCount).toBe(at);
    expect(h.last().logReset).toBe(true);
    expect(JSON.stringify(h.host.session!.state)).toBe(state);
    // A replay file (JSON) loaded into a new host.
    const other = harness(["random", "random"], "unused");
    other.host.handle({ kind: "settings", settings: { paused: true } });
    other.host.handle({ kind: "loadReplay", replay: JSON.parse(JSON.stringify(replay)) as Replay });
    expect(JSON.stringify(other.host.session!.state)).toBe(state);
    expect(h.errors()).toEqual([]);
  });

  it("checks decks with the engine (CR 6.1) and reports a deck it refuses as an error", () => {
    const h = harness(["human", "human"]);
    h.host.handle({ kind: "validateDeck", requestId: 7, deck: { main: ["SD01-001"], evolve: [] }, deckRestrictions: true });
    const reply = h.messages.find((m) => m.kind === "deckValidation");
    expect(reply).toMatchObject({ requestId: 7 });
    expect((reply as { errors: string[] }).errors.length).toBeGreaterThan(0);
    h.host.handle({ kind: "start", options: { ...h.options, decks: [{ main: ["SD01-001"], evolve: [] }, deck("sd02")] } });
    expect(h.errors().length).toBe(1);
  });
});
