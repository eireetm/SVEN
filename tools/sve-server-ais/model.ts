/**
 * sve-server's AIs imitated over our engine (docs/bot.md section 10): benchmark opponents for `npm run bot:arena`, not part
 * of the game. Their logic is ported from the decompiled Game.dll (its author agreed to its use, CLAUDE.md). This file is
 * their view of a game: cards and players with the fields their code reads, built from our session.
 */
import type { Answer, CardId, CardView, Decision, Engine, GameReader, GameSession, HiddenCardView, MainAction, PlayerId, PlayerSideView, PlayerView, QuickAction } from "../../packages/core/src";
import { evolvedDefOf } from "./catalog";

/** Their Card, for the fields their AIs read. */
export interface SCard {
  id: CardId;
  /** The printed card (their CardConfig). */
  def: string;
  /** The definition that gives its abilities now: the evolved card while evolved. */
  abilityDef: string;
  owner: PlayerId;
  isLeader: boolean;
  /** "follower" (随从), "amulet" (魔法阵), "spell" (法术), "leader", "crest" ... */
  type: string;
  cost: number;
  /** Current attack and defense (a leader: its defense). */
  atk: number;
  hp: number;
  /** MaxHp: the defense before damage. */
  maxHp: number;
  /** The printed attack and defense (their CardConfig.Attack / HP). */
  printedAtk: number;
  printedHp: number;
  /** IfKiller: Bane. */
  killer: boolean;
  /** IfGuard: Ward. */
  guard: boolean;
  /** IfHpSteal: Drain. */
  hpSteal: boolean;
  /** IfSelectDisable: Aura. */
  selectDisable: boolean;
  /** IfPlayerKiller: no such keyword in SVE (always false). */
  playerKiller: boolean;
  engaged: boolean;
  zone: "field" | "hand" | "ex" | "leader" | "resolution";
  /** Their Description: the printed card's Chinese text. */
  textCn: string;
  /** Description and EvoDescription: with its evolved card's text (their DescriptionContains). */
  textCnAll: string;
  textEn: string;
}

/** Their Player, for the fields their AIs read. */
export interface SPlayer {
  id: PlayerId;
  hp: number;
  pp: number;
  ep: number;
  /** ExPowerPoint: super evolution points. */
  sep: number;
  /** Player.Turn: the player's own turns, this one included. */
  turn: number;
  leader: SCard;
  /** HandCards that are not EX cards (theirs keep the EX area in the hand list, flagged IfExCard). */
  hand: SCard[];
  handCount: number;
  ex: SCard[];
  /** BattleCards: followers and amulets on the field. */
  board: SCard[];
  deckCount: number;
  maxBoard: number;
  maxHand: number;
  first: boolean;
}

export const MAX_BOARD = 5;
export const MAX_HAND = 7;

function cardOf(engine: Engine, reader: GameReader, v: CardView, zone: SCard["zone"], leaderDefense?: number): SCard {
  const def = engine.db.has(v.def) ? engine.db.get(v.def) : null;
  let abilityDef = v.def;
  try {
    abilityDef = reader.info(v.id).def.id;
  } catch {
    // a card the reader can't show: its printed definition
  }
  const current = engine.db.has(abilityDef) ? engine.db.get(abilityDef) : def;
  const evolvedId = evolvedDefOf(engine, v.def);
  const k = new Set(v.keywords);
  const hp = zone === "leader" ? (leaderDefense ?? 0) : (v.defense ?? 0);
  return {
    id: v.id,
    def: v.def,
    abilityDef,
    owner: v.controller,
    isLeader: zone === "leader",
    type: v.type,
    cost: Math.max(0, v.cost ?? 0),
    atk: Math.max(0, v.attack ?? 0),
    hp,
    maxHp: hp + Math.max(0, v.damage ?? 0),
    printedAtk: Math.max(0, def?.attack ?? v.attack ?? 0),
    printedHp: Math.max(0, def?.defense ?? v.defense ?? 0),
    killer: k.has("bane"),
    guard: k.has("ward"),
    hpSteal: k.has("drain"),
    selectDisable: k.has("aura"),
    playerKiller: false,
    engaged: v.engaged,
    zone,
    textCn: def?.text.cn ?? "",
    textCnAll: (def?.text.cn ?? "") + " " + (evolvedId ? (engine.db.get(evolvedId).text.cn ?? "") : current !== def ? (current?.text.cn ?? "") : ""),
    textEn: current?.text.en ?? "",
  };
}

const visible = (c: CardView | HiddenCardView): c is CardView => !c.hidden;

function playerOf(engine: Engine, reader: GameReader, view: PlayerView, side: PlayerSideView): SPlayer {
  const leader: SCard = side.leader
    ? cardOf(engine, reader, side.leader, "leader", side.leaderDefense)
    : {
        id: `leader-${side.id}`,
        def: "",
        abilityDef: "",
        owner: side.id,
        isLeader: true,
        type: "leader",
        cost: 0,
        atk: 0,
        hp: side.leaderDefense,
        maxHp: side.leaderDefense,
        printedAtk: 0,
        printedHp: 0,
        killer: false,
        guard: false,
        hpSteal: false,
        selectDisable: false,
        playerKiller: false,
        engaged: false,
        zone: "leader",
        textCn: "",
        textCnAll: "",
        textEn: "",
      };
  return {
    id: side.id,
    hp: side.leaderDefense,
    pp: side.playPoints,
    ep: side.evolutionPoints,
    sep: side.superEvolutionPoints,
    turn: side.turnsPassed,
    leader,
    hand: side.hand.filter(visible).map((c) => cardOf(engine, reader, c, "hand")),
    handCount: side.hand.length,
    ex: side.ex.map((c) => cardOf(engine, reader, c, "ex")),
    board: side.field.filter(visible).map((c) => cardOf(engine, reader, c, "field")),
    deckCount: side.deckCount,
    maxBoard: MAX_BOARD,
    maxHand: MAX_HAND,
    first: view.firstPlayer === side.id,
  };
}

/** A game as their AI sees it at one of its decisions. */
export class SBattle {
  readonly view: PlayerView;
  readonly me: SPlayer;
  readonly enemy: SPlayer;
  readonly decision: Decision;
  /** The global turn. */
  readonly turn: number;
  /** Cards being played (the resolution zone): a spell asking for its targets. */
  readonly resolving: SCard[];
  private readonly cards = new Map<CardId, SCard>();

  /**
   * `attackers`: the followers that could attack at this player's last main phase decision of this turn (their CanAttack()
   * is a card's state; ours comes from a decision's actions, so other decisions of the turn use the last main phase one's).
   */
  constructor(
    readonly engine: Engine,
    readonly session: GameSession,
    readonly player: PlayerId,
    private readonly attackers: ReadonlySet<CardId> = new Set(),
  ) {
    this.view = session.view(player);
    this.decision = session.decision!;
    const reader = session.reader();
    this.me = playerOf(engine, reader, this.view, this.view.players[player]);
    this.enemy = playerOf(engine, reader, this.view, this.view.players[player === 0 ? 1 : 0]);
    this.turn = this.view.turn;
    this.resolving = (this.view.resolution ?? []).map((c) => cardOf(engine, reader, c, "resolution"));
    for (const p of [this.me, this.enemy]) for (const c of [p.leader, ...p.hand, ...p.ex, ...p.board]) this.cards.set(c.id, c);
    for (const c of this.resolving) this.cards.set(c.id, c);
  }

  card(id: CardId): SCard | undefined {
    return this.cards.get(id);
  }

  /** The actions of the pending main phase or quick decision (none once the game is over). */
  actions(): readonly (MainAction | QuickAction)[] {
    const d = this.decision as Decision | null;
    return d?.type === "mainPhase" || d?.type === "quick" ? d.actions : [];
  }

  /** CanAttack(): the decision offers an attack by it (outside main phase decisions: it could at the last one). */
  canAttack(card: SCard): boolean {
    const d = this.decision as Decision | null;
    if (d?.type === "mainPhase" || d?.type === "quick") return this.actions().some((a) => a.type === "attack" && a.attacker === card.id);
    return this.attackers.has(card.id);
  }

  /** GetAttackAbleTarget(): the targets the decision offers it. */
  attackTargets(card: SCard): SCard[] {
    const out: SCard[] = [];
    for (const a of this.actions()) if (a.type === "attack" && a.attacker === card.id) out.push(this.card(a.target) ?? this.enemy.leader);
    return out;
  }

  /** InquickTurn: answering the opponent's quick window. */
  get inQuick(): boolean {
    return (this.decision as Decision | null)?.type === "quick";
  }
}

/**
 * The followers a player can attack with at a main phase decision, remembered for the turn's other decisions (SBattle
 * `attackers`).
 */
export class AttackerMemory {
  private turn = -1;
  private set: ReadonlySet<CardId> = new Set();

  note(session: GameSession, d: Decision): void {
    if (d.type !== "mainPhase") return;
    this.turn = session.view(d.player).turn;
    this.set = new Set(d.actions.filter((a) => a.type === "attack").map((a) => (a as Extract<MainAction, { type: "attack" }>).attacker));
  }

  of(session: GameSession, player: PlayerId): ReadonlySet<CardId> {
    return session.view(player).turn === this.turn ? this.set : new Set();
  }
}

/** Their DescriptionContains: the card's Chinese text and its evolved card's (Description, EvoDescription). */
export const textContains = (card: { textCnAll: string }, word: string) => card.textCnAll.includes(word);

/** Card.GetValue(): a follower's attack and defense, an amulet's cost (their CardConfig.ExtraValue is 0 here). */
export function cardValue(card: SCard): number {
  if (card.type === "follower") return card.atk * 6 + card.hp * 6;
  if (card.type === "amulet") return card.cost * 5;
  return 0;
}

/** Player.GetAverageCost() over our whole main deck (no tokens): the cards in hand, deck, field, EX area and cemetery. */
export function averageCost(session: GameSession, player: PlayerId): { average: number; size: number } {
  const reader = session.reader();
  let sum = 0;
  let size = 0;
  for (const zone of ["hand", "deck", "field", "ex", "cemetery"] as const) {
    for (const id of reader.cards(player, zone)) {
      const info = reader.info(id);
      if (info.type === "leader" || info.evolved || info.baseDef.token) continue;
      sum += Math.max(0, info.cost ?? 0);
      size += 1;
    }
  }
  return { average: size > 0 ? sum / size : 3.2, size };
}

export const mainAnswer = (action: MainAction): Answer => ({ type: "mainPhase", action });
export const quickAnswer = (action: QuickAction): Answer => ({ type: "quick", action });
export const endTurn = (d: Decision): Answer =>
  d.type === "quick" ? { type: "quick", action: { type: "pass" } } : { type: "mainPhase", action: { type: "endMainPhase" } };

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** The option that plays a card for more play points (Card.Refresh plays at the highest enhance cost it can afford). */
export function enhanceOption(d: Extract<Decision, { type: "choose" }>): string | null {
  let best: { id: string; n: number } | null = null;
  for (const o of d.options) {
    const m = /for (\d+) more play points?/i.exec(o.label);
    if (m && (!best || Number(m[1]) > best.n)) best = { id: o.id, n: Number(m[1]) };
  }
  return best?.id ?? null;
}
