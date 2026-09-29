// The game host: runs one game at a time in the engine worker — the core session, the bots, the list of inputs (for undo
// and replays), and what the GUI is shown: views, the pending decision and the log. No worker or DOM API here, so tests
// run it in Node. Nothing in it decides rules: legal answers come from the core's decisions (the decision protocol in
// docs/architecture.md).
import { GreedyBot } from "@sve/bot";
import {
  ALL_AUTO_RESOLVABLE,
  defaultAnswer,
  forcedAnswer,
  isManualInput,
  opponentOf,
  randomAnswer,
  randomInt,
  redactEvent,
  seedRng,
  validateAnswer,
  type AbilityDef,
  type Answer,
  type CardId,
  type Decision,
  type DefId,
  type Engine,
  type GameEvent,
  type GameSession,
  type Input,
  type PlayerId,
  type PlayerSideView,
  type PlayerView,
} from "@sve/core";
import type {
  AbilitySummary,
  CardInfo,
  ChoiceMade,
  DecisionInfo,
  FromWorker,
  GameOptions,
  GameUpdate,
  HostSettings,
  LogEntry,
  ManualInfo,
  QuickAnnouncement,
  RecordedInput,
  Replay,
  SeatController,
  ToWorker,
  WatchState,
} from "./protocol";
import { forEachCard } from "./view-utils";

export interface Scheduler {
  /** Run `fn` after `ms` milliseconds; the returned function cancels it. */
  schedule(fn: () => void, ms: number): () => void;
}

export const timerScheduler: Scheduler = {
  schedule(fn, ms) {
    const timer = setTimeout(fn, ms);
    return () => clearTimeout(timer);
  },
};

interface Bot {
  decide(game: GameSession): Answer;
}

/** A bot for a seat, seeded from the game (the same game and inputs give the same bot answers). */
function makeBot(engine: Engine, controller: SeatController, seed: string, seat: PlayerId): Bot | null {
  if (controller === "greedy") return new GreedyBot(engine, { seed: `${seed}:greedy:${seat}` });
  if (controller === "random") {
    const rng = seedRng(`${seed}:random:${seat}`);
    return { decide: (game) => randomAnswer(rng, game.decision!) };
  }
  return null;
}

/** How an ability reads on a button (the GUI words it). */
export function summarizeAbility(ability: AbilityDef | undefined, def: DefId): AbilitySummary {
  const granted = def.includes(":") ? { granted: true } : {};
  if (!ability) return { kind: "unknown", ...granted };
  if (ability.kind === "activated") {
    const cost = ability.cost;
    return {
      kind: "activated",
      ...(cost.playPoints ? { pp: cost.playPoints } : {}),
      ...(cost.engageSelf ? { engage: true } : {}),
      ...(cost.burySelf ? { bury: true } : {}),
      ...(cost.leaderDefense ? { leaderDefense: cost.leaderDefense } : {}),
      ...(cost.custom ? { custom: true } : {}),
      ...(ability.quick ? { quick: true } : {}),
      ...(ability.advanced ? { advanced: true } : {}),
      ...granted,
    };
  }
  if (ability.kind === "automatic") return { kind: "automatic", timing: ability.timing, ...granted };
  return { kind: "spell", ...granted };
}

/** GameConfig.firstPlayer for a game's turn order: a given player, one drawn from the seed ("random"), or null (CR 6.2.1.6). */
export function firstPlayerOf(options: Pick<GameOptions, "seed" | "turnOrder">): PlayerId | null {
  switch (options.turnOrder) {
    case "player1":
      return 0;
    case "player2":
      return 1;
    case "random":
      return randomInt(seedRng(`${options.seed}:turnOrder`), 2) as PlayerId;
    default:
      return null;
  }
}

/** The engine's configuration for a game's options (pacing and testing choices; the rules are the same). */
function configOf(options: GameOptions) {
  const autoResolve = ALL_AUTO_RESOLVABLE.filter(
    (type) => !(type === "mainPhase" && options.showEveryMainPhase) && !(type === "quick" && options.askEveryQuickWindow),
  );
  return { deckRestrictions: options.deckRestrictions, autoResolve, manualActions: options.manualActions === true, firstPlayer: firstPlayerOf(options) };
}

/** A replay being watched: its inputs, played back one by one (docs/gui.md "录像"). */
interface Watching {
  inputs: RecordedInput[];
  playing: boolean;
  speed: number;
  perspective: PlayerId;
  /** Inputs the engine can play (all, or up to the one it refused: `stopped`). */
  total: number;
  turns: number[];
  stops: number[];
  stopped: string | null;
}

/** A quick window where passing is all its player can do (asked only with GameOptions.askEveryQuickWindow). */
const onlyPass = (decision: Decision): boolean => decision.type === "quick" && decision.actions.every((a) => a.type === "pass");

/** The choices told in an announcement (how damage is divided or ordered shows on the table and in the log). */
const CHOICES_TOLD = new Set<ChoiceMade["reason"]>(["mode", "playOption", "token", "deckPosition", "unionBurst", "dieReroll", "effect"]);

/** A Quick card or ability played at quick timing (CR 7.4.5 / 8.4.7), followed until it has resolved (its announcement). */
interface QuickPlay {
  player: PlayerId;
  /** The card played (its id before it moved, CR 4.1.4), or the card whose ability is activated. */
  card: CardId;
  ability: number | null;
  /** The played card's id in the resolution zone. */
  resolving: CardId | null;
  info: CardInfo | null;
  /** CR 10.6.2.7 — it has been played. */
  played: boolean;
  /** The played card has left the resolution zone (CR 10.6.2.8: it has resolved). */
  resolved: boolean;
  targets: QuickAnnouncement["targets"];
  choices: ChoiceMade[];
}

/** Event fields that hold card ids (for the names a log entry needs). */
const CARD_KEYS = new Set(["card", "newCard", "target", "attacker", "defender", "source", "follower", "evolveCard", "token", "cards", "id"]);

export class GameHost {
  private game: GameSession | null = null;
  private options: GameOptions | null = null;
  private inputs: RecordedInput[] = [];
  private bots: [Bot | null, Bot | null] = [null, null];
  private settings: HostSettings = { botDelayMs: 600, revealAll: false, paused: false, manualDebug: false, announceQuick: false, attackPauseMs: 0 };
  private cancelTimer: (() => void) | null = null;
  /** Log entries not sent yet. */
  private log: LogEntry[] = [];
  private logReset = false;
  private logSeq = 0;
  /** Cards the log's viewer has seen, by id (CR 4.1.4: a card gets a new id in each zone). */
  private readonly known = new Map<CardId, CardInfo>();
  private lastPerspective: PlayerId = 0;
  /** The quick play being followed, and the one people are shown (the game waits until they have seen it). */
  private quick: QuickPlay | null = null;
  private announcement: QuickAnnouncement | null = null;
  private announcementSeq = 0;
  /** Inputs played again (rewind, replays) are not announced. */
  private replaying = false;
  /** A quick window after an attack is being shown before the host passes it (HostSettings.attackPauseMs). */
  private passing = false;
  /** The replay being watched (null: a game being played). */
  private watching: Watching | null = null;

  constructor(
    private readonly engine: Engine,
    private readonly send: (message: FromWorker) => void,
    private readonly scheduler: Scheduler = timerScheduler,
  ) {}

  handle(message: ToWorker): void {
    switch (message.kind) {
      case "start":
        this.watching = null;
        return this.begin(message.options, []);
      case "answer":
        return this.watching ? undefined : this.answer(message.seat, message.answer);
      case "concede":
        return this.watching ? undefined : this.concede(message.seat);
      case "rewind":
        if (this.watching) return this.seek(message.inputs, false);
        if (this.options) this.begin(this.options, this.inputs.slice(0, Math.max(0, message.inputs)));
        return;
      case "loadReplay":
        this.watching = null;
        return this.begin(message.replay.options, message.replay.inputs.slice(0, message.inputs ?? message.replay.inputs.length));
      case "watch":
        return this.startWatching(message.replay);
      case "watchControl":
        return this.controlWatch(message);
      case "exportReplay":
        return this.send({ kind: "replay", requestId: message.requestId, replay: this.replay() });
      case "settings": {
        const reveal = message.settings.revealAll !== undefined && message.settings.revealAll !== this.settings.revealAll;
        this.settings = { ...this.settings, ...message.settings };
        if (!this.settings.announceQuick) this.announcement = null;
        // Watching, the log is written for its viewer: showing the hidden cards or not writes it again.
        if (this.watching && reveal) return this.seek(this.inputs.length, this.watching.playing);
        return this.pump();
      }
      case "step": {
        if (this.watching) return this.controlWatch({ step: 1 });
        // Stepping on is also seeing the announcement; then a bot's answer, or the host's pass of a quick window.
        const decision = this.game?.decision;
        this.announcement = null;
        return decision && this.bots[decision.player] ? this.stepBot() : this.pump();
      }
      case "acknowledge":
        if (this.announcement?.seq !== message.seq) return;
        this.announcement = null;
        return this.pump();
      case "validateDeck":
        return this.send({
          kind: "deckValidation",
          requestId: message.requestId,
          errors: this.engine.validateDeck(message.deck, { deckRestrictions: message.deckRestrictions }),
        });
    }
  }

  /** The current game as a replay (seed, decks, inputs, how it ended), or null before any game. */
  replay(): Replay | null {
    const game = this.game;
    if (!this.options || !game) return null;
    return { format: "sve-replay", version: 1, options: this.options, inputs: [...this.inputs], info: { result: game.result, turn: game.state.turn } };
  }

  /** The session (tests). */
  get session(): GameSession | null {
    return this.game;
  }

  /** A new game, then its first inputs again (rewind, replays). Bots start afresh: replayed answers are not re-decided. */
  private begin(options: GameOptions, replay: readonly RecordedInput[]): void {
    this.stopTimer();
    let game: GameSession;
    try {
      game = this.engine.newGame({ seed: options.seed, players: options.decks, config: configOf(options) });
    } catch (err) {
      return this.error(err);
    }
    this.game = game;
    this.options = options;
    this.inputs = [];
    // Watching, nobody plays: the replay's inputs are its answers.
    this.bots = this.watching
      ? [null, null]
      : [makeBot(this.engine, options.controllers[0], options.seed, 0), makeBot(this.engine, options.controllers[1], options.seed, 1)];
    this.known.clear();
    this.log = [];
    this.logSeq = 0;
    this.logReset = true;
    this.lastPerspective = this.humans()[0] ?? 0;
    this.quick = null;
    this.announcement = null;
    this.record(game.startupEvents);
    this.replaying = true;
    for (const recorded of replay) {
      if (!game.decision) break;
      try {
        this.apply(recorded.input, recorded.by);
      } catch (err) {
        this.error(err, `the replay stopped at input ${this.inputs.length + 1}`);
        break;
      }
    }
    this.replaying = false;
    this.quick = null;
    this.pump();
  }

  private answer(seat: PlayerId, answer: Answer): void {
    const game = this.game;
    const decision = game?.decision;
    if (!game || !decision) return this.error("there is no decision to answer");
    // A manual operation (testing by hand) may come from a person at any main phase decision, a bot's too (bots paused).
    const manual = isManualInput(answer);
    if (manual ? this.bots[seat] !== null : decision.player !== seat || this.bots[seat]) return this.error(`it is not player ${seat + 1}'s decision`);
    const problem = manual && answer.action.type === "manual" ? game.manualOpError(answer.action.op) : validateAnswer(decision, answer);
    if (problem) return this.error(`illegal answer: ${problem}`);
    this.announcement = null; // whoever answers has seen the table
    try {
      this.apply(answer, seat);
    } catch (err) {
      return this.error(err);
    }
    this.pump();
  }

  private concede(seat: PlayerId): void {
    const game = this.game;
    if (!game || game.isOver) return;
    try {
      this.apply({ type: "concede", player: seat }, seat);
    } catch (err) {
      return this.error(err);
    }
    this.pump();
  }

  private apply(input: Input, by: PlayerId | null): void {
    const game = this.game!;
    const decision = game.decision;
    this.rememberVisible();
    this.followAnswer(decision, input);
    const events = game.act(input, by ?? undefined);
    this.inputs.push({ input, by });
    this.record(events);
    this.followEvents(events);
  }

  /**
   * Publish the state; if a bot must answer, answer after the delay. A quick play that has resolved is announced first, and
   * everything waits until a person has seen it ("acknowledge"); quick windows where passing is all a player can do are
   * passed here, as the core's autoResolve would (GameOptions.askEveryQuickWindow).
   */
  private pump(): void {
    this.stopTimer();
    const game = this.game;
    if (!game) return;
    if (this.watching) return this.pumpWatch();
    this.passing = false;
    this.settleQuick();
    if (game.isOver) this.announcement = null;
    while (!this.announcement && game.decision && onlyPass(game.decision)) {
      // After an attack is declared (CR 8.4.5-8.4.7), the table shows it a moment before its combat.
      if (game.decision.type === "quick" && game.decision.timing === "attack" && this.settings.attackPauseMs > 0) {
        this.passing = true;
        this.publish(false);
        this.cancelTimer = this.scheduler.schedule(() => {
          this.cancelTimer = null;
          this.passing = false;
          try {
            this.apply({ type: "quick", action: { type: "pass" } }, null);
          } catch (err) {
            return this.error(err);
          }
          this.pump();
        }, this.settings.attackPauseMs);
        return;
      }
      try {
        this.apply({ type: "quick", action: { type: "pass" } }, null);
      } catch (err) {
        return this.error(err);
      }
      this.settleQuick();
    }
    const decision = game.decision;
    const thinking = decision !== null && !this.announcement && this.bots[decision.player] !== null && !this.settings.paused;
    this.publish(thinking);
    // A bot answers a decision with a single answer (a main phase it can only end) without the pause.
    if (thinking) this.cancelTimer = this.scheduler.schedule(() => this.stepBot(), forcedAnswer(decision) ? 0 : this.settings.botDelayMs);
  }

  /** One bot answer (also the debug "step" while bots are paused). A failing bot gives the core's safe default answer. */
  private stepBot(): void {
    this.cancelTimer = null;
    const game = this.game;
    const decision = game?.decision;
    if (!game || !decision) return;
    const bot = this.bots[decision.player];
    if (!bot) return;
    let answer: Answer;
    try {
      answer = bot.decide(game);
    } catch (err) {
      this.error(err, "the bot failed and gave the default answer");
      answer = defaultAnswer(decision);
    }
    try {
      this.apply(answer, decision.player);
    } catch (err) {
      this.settings = { ...this.settings, paused: true };
      this.error(err, "the bot's answer was refused; bots are paused");
    }
    this.pump();
  }

  private stopTimer(): void {
    this.cancelTimer?.();
    this.cancelTimer = null;
  }

  /**
   * Watch a replay: play it through once at once (where its turns begin, where a step goes, and whether the engine can play
   * it all: a replay from another version of the engine or the cards may stop), then from its start, input by input.
   */
  private startWatching(replay: Replay): void {
    const speed = this.watching?.speed ?? 1;
    let checked: Pick<Watching, "total" | "turns" | "stops" | "stopped">;
    try {
      checked = this.checkReplay(replay);
    } catch (err) {
      return this.error(err);
    }
    this.watching = { inputs: replay.inputs, playing: true, speed, perspective: 0, ...checked };
    this.begin(replay.options, []);
  }

  private checkReplay(replay: Replay): Pick<Watching, "total" | "turns" | "stops" | "stopped"> {
    const game = this.engine.newGame({ seed: replay.options.seed, players: replay.options.decks, config: configOf(replay.options) });
    const turns = game.startupEvents.some((e) => e.type === "turnStarted") ? [0] : [];
    const stops: number[] = [];
    let total = 0;
    let stopped: string | null = null;
    for (const [i, { input, by }] of replay.inputs.entries()) {
      const decision = game.decision;
      if (!decision || game.isOver) break;
      // A step goes to after each answer of a player, and after the quick window of each attack (its combat).
      const stop = by !== null || (decision.type === "quick" && decision.timing === "attack");
      let events: readonly GameEvent[];
      try {
        events = game.act(input, by ?? undefined);
      } catch (err) {
        stopped = `${i + 1}: ${err instanceof Error ? err.message : String(err)}`;
        break;
      }
      total = i + 1;
      if (stop) stops.push(total);
      if (events.some((e) => e.type === "turnStarted")) turns.push(total);
    }
    if (stops.at(-1) !== total) stops.push(total);
    return { total, turns, stops, stopped };
  }

  /** Watching: publish, then the next input after the pause its kind deserves (none at the end, or paused). */
  private pumpWatch(): void {
    const watching = this.watching!;
    const game = this.game!;
    this.settleQuick();
    if (this.inputs.length >= watching.total || !game.decision) watching.playing = false;
    this.publish(false);
    if (!watching.playing) return;
    const next = watching.inputs[this.inputs.length]!;
    this.cancelTimer = this.scheduler.schedule(() => this.watchInputs(this.inputs.length + 1), this.watchPause(next) / watching.speed);
  }

  /** How long the table stays before the next input is played (at the normal speed). */
  private watchPause(next: RecordedInput): number {
    const decision = this.game!.decision;
    if (this.announcement) return 1800; // a Quick play: time to read its window
    if (next.by === null) return decision?.type === "quick" && decision.timing === "attack" ? 600 : 0; // the attack stands a moment
    return decision?.type === "mainPhase" || decision?.type === "quick" ? 1100 : 700;
  }

  /** Play the replay's inputs up to `position` (with the animations of what they do). */
  private watchInputs(position: number): void {
    this.cancelTimer = null;
    const watching = this.watching;
    const game = this.game;
    if (!watching || !game) return;
    this.announcement = null;
    while (this.inputs.length < Math.min(position, watching.total) && game.decision) {
      const next = watching.inputs[this.inputs.length]!;
      try {
        this.apply(next.input, next.by);
      } catch (err) {
        // The dry run passed it: nothing should differ; stop rather than go on with another game.
        watching.stopped = `${this.inputs.length + 1}: ${err instanceof Error ? err.message : String(err)}`;
        watching.total = this.inputs.length;
        break;
      }
      if (this.inputs.length < position) this.settleQuick();
    }
    this.pump();
  }

  /** Go to a position of the replay at once (no animations: the table and the log are shown as they are there). */
  private seek(position: number, playing: boolean): void {
    const watching = this.watching;
    if (!watching || !this.options) return;
    watching.playing = playing;
    this.begin(this.options, watching.inputs.slice(0, Math.max(0, Math.min(position, watching.total))));
  }

  /** The playback's buttons: play, pause, speed, go to, one step forward or back, whose view. */
  private controlWatch(control: Extract<ToWorker, { kind: "watchControl" }> | { step: 1 | -1 }): void {
    const watching = this.watching;
    if (!watching) return;
    const position = this.inputs.length;
    if ("speed" in control && control.speed !== undefined) watching.speed = Math.min(8, Math.max(0.25, control.speed));
    if ("perspective" in control && control.perspective !== undefined && control.perspective !== watching.perspective) {
      watching.perspective = control.perspective;
      // The log is written for its viewer: from this side's view again.
      return this.seek(position, control.playing ?? watching.playing);
    }
    if ("seek" in control && control.seek !== undefined) return this.seek(control.seek, control.playing ?? watching.playing);
    if (control.step === 1) {
      watching.playing = false;
      this.stopTimer();
      return this.watchInputs(watching.stops.find((stop) => stop > position) ?? watching.total);
    }
    if (control.step === -1) return this.seek([...watching.stops].reverse().find((stop) => stop < position) ?? 0, false);
    if ("playing" in control && control.playing !== undefined) {
      // Play at the end: from the start again.
      if (control.playing && position >= watching.total) return this.seek(0, true);
      watching.playing = control.playing;
    }
    this.pump();
  }

  private watchState(): WatchState | null {
    const watching = this.watching;
    if (!watching) return null;
    const { playing, speed, total, turns, stops, stopped } = watching;
    return { position: this.inputs.length, total, playing, speed, turns, stops, stopped };
  }

  /** Start following a Quick card or ability played at quick timing (CR 7.4.5 / 8.4.7); note the choices made for it. */
  private followAnswer(decision: Decision | null, input: Input): void {
    if (this.replaying || !decision) return;
    if (decision.type === "quick" && input.type === "quick" && input.action.type !== "pass") {
      const action = input.action;
      const ability = action.type === "activate" ? action.ability : null;
      this.quick = { player: decision.player, card: action.card, ability, resolving: null, info: null, played: false, resolved: false, targets: [], choices: [] };
      return;
    }
    const quick = this.quick;
    if (!quick || decision.type !== "choose" || input.type !== "choose" || decision.player !== quick.player || !CHOICES_TOLD.has(decision.reason)) return;
    if (decision.source !== null && (decision.source === quick.resolving || decision.source === quick.card)) {
      quick.choices.push({ reason: decision.reason, options: decision.options, ids: input.ids });
    }
  }

  /** What the followed quick play's events tell: where the card went, that it was played, what it selected (public zones). */
  private followEvents(events: readonly GameEvent[]): void {
    const quick = this.quick;
    if (!quick) return;
    for (const event of events) {
      switch (event.type) {
        case "cardsMoved":
          for (const move of event.moves) {
            if (quick.ability === null && quick.resolving === null && move.card === quick.card && move.to.zone === "resolution" && move.newCard) {
              quick.resolving = move.newCard;
              quick.info = { def: move.def, printing: move.printing || null };
            } else if (quick.resolving !== null && move.card === quick.resolving && move.from?.zone === "resolution") {
              quick.resolved = true;
            }
          }
          break;
        case "cardPlayed":
          if (event.card === quick.resolving) quick.played = true;
          break;
        case "abilityPlayed":
          if (quick.ability !== null && event.source === quick.card && event.ability === quick.ability) {
            quick.played = true;
            quick.info ??= this.cardInfo(event.source, event.sourceDef);
          }
          break;
        case "cardsSelected":
          if (event.source === null || (event.source !== quick.resolving && event.source !== quick.card)) break;
          for (const id of event.cards) {
            const card = this.cardInfo(id);
            if (card && !quick.targets.some((target) => target.id === id)) quick.targets.push({ id, card });
          }
          break;
        default:
          break;
      }
    }
  }

  /** A card's definition and printing, as the log's viewer knows it (or as an event named it). */
  private cardInfo(id: CardId, def?: DefId): CardInfo | null {
    const known = this.known.get(id);
    if (known) return known;
    const state = this.game?.state.cards[id];
    if (def && !def.includes(":")) return { def, printing: state?.printing ?? null };
    return null;
  }

  /**
   * The followed quick play has resolved (CR 10.6.2.8): a played card has left the resolution zone; an ability's resolution
   * asks nothing more about its card; or the quick window asks again (7.4.5 / 8.4.7). It becomes the announcement when
   * people play and want to see it.
   */
  private settleQuick(): void {
    const game = this.game!;
    const quick = this.quick;
    if (!quick) return;
    if (game.isOver) {
      this.quick = null;
      return;
    }
    const decision = game.decision;
    const again = decision !== null && decision.type === "quick" && decision.player === quick.player;
    const resolved =
      quick.resolved || again || decision === null || (quick.ability !== null && (!("source" in decision) || decision.source !== quick.card));
    if (!quick.played || !resolved) return;
    this.quick = null;
    if (!this.settings.announceQuick || this.humans().length === 0 || !quick.info) return;
    this.announcement = {
      seq: ++this.announcementSeq,
      player: quick.player,
      card: quick.info,
      ability: quick.ability,
      source: quick.resolving ?? quick.card,
      targets: quick.targets,
      choices: quick.choices,
    };
  }

  private humans(): PlayerId[] {
    return ([0, 1] as const).filter((p) => this.bots[p] === null);
  }

  /** Whose view to show: the only person; in hot seat, the player who must decide; with bots only, player 1; watching, the one chosen. */
  private perspective(): PlayerId {
    if (this.watching) return this.watching.perspective;
    const humans = this.humans();
    if (humans.length === 1) return humans[0]!;
    if (humans.length === 2) {
      const decision = this.game?.decision;
      if (decision) this.lastPerspective = decision.player;
      return this.lastPerspective;
    }
    return 0;
  }

  /** Everything is shown with bots only (watching them) and when debugging ("reveal all"); a replay as its watcher chose. */
  private seesAll(): boolean {
    if (this.watching) return this.settings.revealAll;
    return this.settings.revealAll || this.humans().length === 0;
  }

  /** Whose information the log shows: the one person, else everything (hot seat, watching bots, debugging); a replay's viewer. */
  private logViewer(): PlayerId | "all" {
    if (this.watching) return this.settings.revealAll ? "all" : this.watching.perspective;
    const humans = this.humans();
    return this.seesAll() || humans.length !== 1 ? "all" : humans[0]!;
  }

  private view(viewer: PlayerId): PlayerView {
    const game = this.game!;
    const view = game.view(viewer);
    if (!this.seesAll()) return view;
    // Each side as its own player sees it (CR 4.1.2): hands and evolve decks become visible; decks stay unknown.
    const other = opponentOf(viewer);
    const players: [PlayerSideView, PlayerSideView] = [view.players[0], view.players[1]];
    players[other] = game.view(other).players[other];
    return { ...view, players };
  }

  private decisionInfo(): DecisionInfo | null {
    const game = this.game!;
    const decision = game.decision;
    if (!decision || this.bots[decision.player] || this.passing || this.watching) return null;
    const visible = new Map<CardId, CardInfo>();
    forEachCard(game.view(decision.player), (card) => visible.set(card.id, { def: card.def, printing: card.printing }));
    const cards: Record<CardId, CardInfo> = {};
    const add = (id: CardId | null | undefined, def?: DefId): void => {
      if (!id || cards[id]) return;
      const seen = visible.get(id);
      if (seen) cards[id] = seen;
      else if (def) cards[id] = { def, printing: game.state.cards[id]?.printing ?? null };
    };
    // The player's own cards they know (the evolve deck, the hand being redrawn).
    const own = (id: CardId): void => add(id, game.state.cards[id]?.def);
    const abilities: DecisionInfo["abilities"] = {};
    const reader = game.reader();
    const activated = (card: CardId, ability: number): void => {
      const ref = reader.info(card).abilities[ability];
      abilities[`${card}:${ability}`] = summarizeAbility(ref?.ability, ref?.def ?? "");
    };
    switch (decision.type) {
      case "chooseTurnOrder":
        break;
      case "mulligan":
        decision.hand.forEach(own);
        break;
      case "mainPhase":
        for (const action of decision.actions) {
          if (action.type === "play") add(action.card);
          else if (action.type === "evolve") {
            add(action.card);
            own(action.evolveCard);
          } else if (action.type === "activate") {
            add(action.card);
            activated(action.card, action.ability);
          } else if (action.type === "attack") {
            add(action.attacker);
            add(action.target);
          }
        }
        break;
      case "quick":
        for (const action of decision.actions) {
          if (action.type === "play") add(action.card);
          else if (action.type === "activate") {
            add(action.card);
            activated(action.card, action.ability);
          }
        }
        break;
      case "selectPending":
        for (const id of decision.options) {
          const pending = game.state.pending.find((p) => p.id === id);
          if (!pending) continue;
          add(pending.source, pending.sourceDef.includes(":") ? undefined : pending.sourceDef);
          const ability = this.engine.scripts[pending.sourceDef]?.abilities?.[pending.ability];
          abilities[id] = { ...summarizeAbility(ability, pending.sourceDef), source: pending.source, sourceDef: pending.sourceDef };
        }
        break;
      case "selectCards":
        decision.candidates.forEach((id, i) => add(id, decision.candidateDefs[i]));
        decision.peek?.forEach((ref) => add(ref.id, ref.def));
        add(decision.source);
        break;
      case "choose":
      case "confirm":
        add(decision.source);
        if (decision.subject) add(decision.subject.id, decision.subject.def);
        break;
      case "orderCards":
        decision.cards.forEach((ref) => add(ref.id, ref.def));
        add(decision.source);
        break;
    }
    return { decision, cards, abilities };
  }

  private record(events: readonly GameEvent[]): void {
    const game = this.game!;
    const viewer = this.logViewer();
    for (const raw of events) {
      // A "look at" event is its player's only (CR 5.11); moves are hidden zone by zone (redactEvent, CR 4.1.2).
      if (viewer !== "all" && raw.type === "cardsLookedAt" && raw.player !== viewer) continue;
      const event = viewer === "all" ? raw : redactEvent(raw, viewer);
      this.learn(event);
      this.log.push({ seq: ++this.logSeq, turn: game.state.turn, event, cards: this.cardsIn(event) });
    }
  }

  /** Remember the cards the log's viewer can see now, so later events can name them. */
  private rememberVisible(): void {
    const game = this.game!;
    const viewer = this.logViewer();
    const views = viewer === "all" ? [game.view(0), game.view(1)] : [game.view(viewer)];
    for (const view of views) forEachCard(view, (card) => this.known.set(card.id, { def: card.def, printing: card.printing }));
  }

  private learn(event: GameEvent): void {
    const remember = (id: CardId | null, def: DefId, printing: string | null): void => {
      if (id && def !== "" && !def.includes(":")) this.known.set(id, { def, printing: printing || this.known.get(id)?.printing || null });
    };
    switch (event.type) {
      case "cardsMoved":
        for (const move of event.moves) {
          remember(move.card, move.def, move.printing);
          remember(move.newCard, move.def, move.printing);
        }
        break;
      case "cardPlayed":
        remember(event.card, event.def, null);
        break;
      case "cardsRevealed":
      case "cardsLookedAt":
        for (const card of event.cards) remember(card.id, card.def, null);
        break;
      case "abilityPlayed":
      case "abilityTriggered":
        if (!this.known.has(event.source)) remember(event.source, event.sourceDef, null);
        break;
      default:
        break;
    }
  }

  private cardsIn(event: GameEvent): Record<CardId, CardInfo> {
    const out: Record<CardId, CardInfo> = {};
    const visit = (value: unknown, key: string): void => {
      if (typeof value === "string") {
        const info = CARD_KEYS.has(key) ? this.known.get(value) : undefined;
        if (info) out[value] = info;
      } else if (Array.isArray(value)) {
        for (const item of value) visit(item, key);
      } else if (value !== null && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) visit(v, k);
      }
    };
    visit(event, "");
    return out;
  }

  private publish(thinking: boolean): void {
    const game = this.game;
    const options = this.options;
    if (!game || !options) return;
    const perspective = this.perspective();
    const update: GameUpdate = {
      seed: options.seed,
      controllers: options.controllers,
      deckNames: options.deckNames,
      format: options.format ?? (options.deckRestrictions ? "standard" : "unlimited"),
      secondLeaders: options.secondLeaders ?? [null, null],
      manual: this.manualInfo(),
      announcement: this.announcement,
      watch: this.watchState(),
      perspective,
      view: this.view(perspective),
      decision: this.decisionInfo(),
      waitingFor: this.passing || this.watching ? null : (game.decision?.player ?? null),
      thinking,
      inputCount: this.inputs.length,
      humanInputs: this.inputs.flatMap((r, i) => (r.by !== null && this.bots[r.by] === null && r.input.type !== "concede" ? [i] : [])),
      result: game.result,
      log: this.log,
      logReset: this.logReset,
      settings: { ...this.settings },
    };
    this.log = [];
    this.logReset = false;
    this.send({ kind: "update", update });
  }

  /** What can be done by hand now, when manual debugging is on (the core's options, the abilities' summaries, the decks). */
  private manualInfo(): ManualInfo | null {
    const game = this.game;
    const options = this.settings.manualDebug && !this.watching ? game?.manualOptions() : null;
    if (!game || !options) return null;
    const abilities: ManualInfo["abilities"] = {};
    for (const key of options.activatable) {
      const [card, index] = key.split(":") as [CardId, string];
      const ref = game.reader().info(card).abilities[Number(index)];
      if (ref) abilities[key] = summarizeAbility(ref.ability, ref.def);
    }
    const deck = (p: PlayerId): Record<DefId, number> => {
      const counts: Record<DefId, number> = {};
      for (const id of game.state.players[p].zones.deck) {
        const def = game.state.cards[id]!.def;
        counts[def] = (counts[def] ?? 0) + 1;
      }
      return counts;
    };
    return { ...options, abilities, decks: [deck(0), deck(1)] };
  }

  private error(err: unknown, context?: string): void {
    const message = err instanceof Error ? err.message : String(err);
    this.send({ kind: "error", message: context ? `${context}: ${message}` : message });
  }
}
