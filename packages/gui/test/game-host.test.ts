import { describe, expect, it } from "vitest";
import { createEngine, randomAnswer, seedRng, type PlayerId } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { firstPlayerOf, GameHost, type Scheduler } from "../src/engine/game-host";
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
  it("publishes the format and a Cross Craft player's second leader (old replays: the format from deck restrictions)", () => {
    const h = harness(["random", "random"]);
    h.host.handle({ kind: "start", options: { ...h.options, deckRestrictions: false, format: "crossCraft", secondLeaders: ["SD02-LD01", null] } });
    expect(h.last().format).toBe("crossCraft");
    expect(h.last().secondLeaders).toEqual(["SD02-LD01", null]);
    h.host.handle({ kind: "start", options: h.options });
    expect(h.last().format).toBe("standard");
    expect(h.last().secondLeaders).toEqual([null, null]);
    expect(h.errors()).toEqual([]);
  });

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

  it("with showEveryMainPhase, asks a person for a main phase they can only end, and bots answer theirs at once", () => {
    const messages: FromWorker[] = [];
    const queue: (() => void)[] = [];
    const delays: number[] = [];
    const host = new GameHost(engine, (m) => messages.push(m), {
      schedule: (fn, ms) => {
        delays.push(ms);
        queue.push(fn);
        return () => {};
      },
    });
    const h = harness(["human", "greedy"]);
    host.handle({ kind: "settings", settings: { botDelayMs: 500 } });
    host.handle({ kind: "start", options: { ...h.options, controllers: ["human", "greedy"], showEveryMainPhase: true } });
    expect(host.session!.state.config.autoResolve).not.toContain("mainPhase");
    const rng = seedRng("only-end");
    let onlyEnd = 0;
    for (let step = 0; step < 3000 && !host.session!.isOver; step++) {
      const decision = host.session!.decision!;
      if (decision.player === 0) {
        if (decision.type === "mainPhase" && decision.actions.length === 1) onlyEnd += 1;
        host.handle({ kind: "answer", seat: 0, answer: randomAnswer(rng, decision) });
      } else queue.shift()!();
    }
    expect(messages.filter((m) => m.kind === "error")).toEqual([]);
    expect(onlyEnd).toBeGreaterThan(0);
    // The greedy bot's own main phases with only "end" were answered without its pause.
    expect(delays).toContain(0);
    expect(delays).toContain(500);
  });

  it("sets who goes first: as the rules say (a random player decides), a random player drawn from the seed, or a given one", () => {
    expect(firstPlayerOf({ seed: "a" })).toBeNull();
    expect(firstPlayerOf({ seed: "a", turnOrder: "choose" })).toBeNull();
    expect(firstPlayerOf({ seed: "a", turnOrder: "player1" })).toBe(0);
    expect(firstPlayerOf({ seed: "a", turnOrder: "player2" })).toBe(1);
    const drawn = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((seed) => firstPlayerOf({ seed, turnOrder: "random" }));
    expect(new Set(drawn)).toEqual(new Set([0, 1]));
    expect(firstPlayerOf({ seed: "s1", turnOrder: "random" })).toBe(drawn[0]);
    for (const [turnOrder, first] of [["player2", 1], ["player1", 0], ["random", drawn[0]]] as const) {
      const h = harness(["human", "human"], "s1");
      h.host.handle({ kind: "start", options: { ...h.options, turnOrder } });
      // Nobody is asked (CR 6.2.1.6 replaced by the setting): the first decision is a mulligan (6.2.1.8), the first player's.
      expect(h.last().decision!.decision.type).toBe("mulligan");
      expect(h.last().decision!.decision.player).toBe(first);
      expect(h.host.session!.state.firstPlayer).toBe(first);
    }
    const rules = harness(["human", "human"], "s1");
    rules.host.handle({ kind: "start", options: rules.options });
    expect(rules.last().decision!.decision.type).toBe("chooseTurnOrder");
  });

  it("after a Quick card or ability played at quick timing, waits until a person has seen it; passes quick windows with nothing to play", () => {
    let announced = 0;
    for (const seed of ["quick-1", "quick-2", "quick-3", "quick-4", "quick-5", "quick-6"]) {
      const h = harness(["human", "random"], seed);
      h.host.handle({ kind: "settings", settings: { announceQuick: true, botDelayMs: 0 } });
      h.host.handle({ kind: "start", options: { ...h.options, decks: [deck("sd03"), deck("sd03")], askEveryQuickWindow: true } });
      expect(h.host.session!.state.config.autoResolve).not.toContain("quick");
      const rng = seedRng(seed);
      for (let step = 0; step < 4000 && !h.last().result; step++) {
        const update = h.last();
        const a = update.announcement;
        if (a) {
          announced += 1;
          // It has resolved (CR 10.6.2.8), and nobody moves on: no bot answer is waiting to run.
          expect(update.view.resolution).toEqual([]);
          expect(update.thinking).toBe(false);
          expect(h.scheduler.run()).toBe(0);
          const script = ALL_SCRIPTS[a.card.def as keyof typeof ALL_SCRIPTS] as { keywords?: string[] } | undefined;
          if (a.ability === null) expect(script?.keywords).toContain("quick");
          for (const target of a.targets) expect(target.card.def).not.toBe("");
          // A late or stale acknowledgement does nothing; the right one lets the game go on.
          h.host.handle({ kind: "acknowledge", seq: a.seq - 1 });
          expect(h.last().announcement?.seq ?? a.seq).toBe(a.seq);
          h.host.handle({ kind: "acknowledge", seq: a.seq });
          expect(h.last().announcement?.seq).not.toBe(a.seq);
          continue;
        }
        if (update.decision) h.host.handle({ kind: "answer", seat: 0, answer: randomAnswer(rng, update.decision.decision) });
        else h.scheduler.run(1);
      }
      expect(h.errors()).toEqual([]);
      const replay = h.host.replay()!;
      // Quick windows where passing was all a player could do were passed by the host (no seat), and a replay repeats them.
      expect(replay.inputs.some((r) => r.by === null && r.input.type === "quick")).toBe(true);
      const again = harness(["human", "random"], "unused");
      again.host.handle({ kind: "settings", settings: { paused: true } });
      again.host.handle({ kind: "loadReplay", replay: JSON.parse(JSON.stringify(replay)) as Replay });
      expect(JSON.stringify(again.host.session!.state)).toBe(JSON.stringify(h.host.session!.state));
      expect(again.last().announcement).toBeNull();
    }
    expect(announced).toBeGreaterThan(0);
  });

  it("after an attack is declared, shows it a moment before its combat when passing is all the other player can do", () => {
    const messages: FromWorker[] = [];
    const queue: { fn: () => void; ms: number }[] = [];
    const host = new GameHost(engine, (m) => messages.push(m), {
      schedule: (fn, ms) => {
        const job = { fn, ms };
        queue.push(job);
        return () => queue.splice(queue.indexOf(job), 1);
      },
    });
    const last = (): GameUpdate => (messages.filter((m) => m.kind === "update").at(-1) as { update: GameUpdate }).update;
    host.handle({ kind: "settings", settings: { botDelayMs: 0, attackPauseMs: 400 } });
    host.handle({ kind: "start", options: { seed: "pause", decks: [deck("sd01"), deck("sd02")], deckNames: ["a", "b"], controllers: ["random", "random"], deckRestrictions: true, askEveryQuickWindow: true } });
    let paused = 0;
    for (let step = 0; step < 5000 && queue.length > 0; step++) {
      const job = queue.shift()!;
      if (job.ms === 400) {
        // The attack is on the table (its arrow), nobody is asked anything, and nothing has been dealt yet.
        const update = last();
        expect(update.view.attack).not.toBeNull();
        expect(update.decision).toBeNull();
        expect(update.waitingFor).toBeNull();
        expect(update.log.some((e) => e.event.type === "attackEnded" || e.event.type === "fought")).toBe(false);
        paused += 1;
      }
      job.fn();
    }
    expect(messages.filter((m) => m.kind === "error")).toEqual([]);
    expect(last().result).not.toBeNull();
    expect(paused).toBeGreaterThan(0);
  });

  it("announces nothing when the setting is off, and the game goes on by itself", () => {
    const h = harness(["human", "random"], "quick-1");
    h.host.handle({ kind: "settings", settings: { announceQuick: false, botDelayMs: 0 } });
    h.host.handle({ kind: "start", options: { ...h.options, decks: [deck("sd03"), deck("sd03")], askEveryQuickWindow: true } });
    const rng = seedRng("quick-1");
    for (let step = 0; step < 4000 && !h.last().result; step++) {
      const update = h.last();
      expect(update.announcement).toBeNull();
      if (update.decision) h.host.handle({ kind: "answer", seat: 0, answer: randomAnswer(rng, update.decision.decision) });
      else h.scheduler.run(1);
    }
    expect(h.last().result).not.toBeNull();
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
