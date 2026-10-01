// Which sounds an update makes, and when (pure: tested in Node). The files:
//  - common sound effects: public/audio/sfx/<name>.<ext>; a missing one tries its fallbacks (SFX), else stays silent;
//  - a card's own sounds: public/audio/cards/<number>-p (played), -a (attacks), -d (destroyed; followers), named by the
//    player (spells and amulets only have -p). A card's own sound comes before the common one, which is then not played
//    for that card. <number> is tried as the printing, then the card's definition (an alternate art may have its own);
//    for an evolved follower, its evolve card's first;
//  - background music: public/audio/bgm/<name>.<ext>, one per screen (BGM).
// The effects keep to the animation's times (animation/plan.ts): a hit sounds as it shows, a destroyed card as it leaves.
import type { CardId, CardType, DefId, PlayerId } from "@sve/core";
import type { LogEntry } from "../engine/protocol";
import { planTimeline, TIMING } from "../game/animation/plan";

/** The common sound effects: public/audio/sfx/<name>, and what is played instead when it is missing. */
export const SFX = {
  /** Cards drawn. */
  draw: [],
  /** A spell played. */
  spell: ["play"],
  /** A follower played. */
  follower: ["play"],
  /** An amulet played. */
  amulet: ["play"],
  /** A follower attacks. */
  attack: [],
  /** Damage to a follower. */
  damage: [],
  /** Damage to a leader. */
  "leader-damage": ["damage"],
  /** A follower or amulet destroyed. */
  destroy: [],
  /** A follower evolves. */
  evolve: [],
  /** A follower super-evolves. */
  "super-evolve": ["evolve"],
  /** A leader heals, or is given defense. */
  heal: [],
  /** A card gains attack or defense. */
  buff: [],
  /** An effect selects cards (the blue arrows). */
  target: [],
  /** Tokens are created. */
  token: [],
  /** Cards are banished. */
  banish: [],
  /** Cards are discarded. */
  discard: [],
  /** A card returns from the field to the hand. */
  bounce: [],
  /** Counters are put on or removed from a card. */
  counter: [],
  /** A deck is shuffled. */
  shuffle: [],
  /** A turn begins. */
  turn: [],
  /** A Quick card or ability resolved: its announcement opens. */
  quick: [],
  /** The game begins (who goes first is known). */
  "game-start": [],
  /** The person at the screen won, lost. */
  win: [],
  lose: [],
  /** A button, a menu item, a checkbox of the interface. */
  click: [],
} as const satisfies Record<string, readonly string[]>;

export type SfxName = keyof typeof SFX;

/** The background music of each screen: menu (main menu, settings, game setup), deck (the deck builder), battle (a game). */
export const BGM = ["menu", "deck", "battle"] as const;
export type BgmName = (typeof BGM)[number];

/** A card's own sound: played ("p"), attacks ("a"), destroyed ("d"). */
export type CardSoundKind = "p" | "a" | "d";

/** A sound to play: a card's own if there is one (`card`), else the common one. */
export interface SoundCue {
  sfx: SfxName;
  card?: { ids: string[]; kind: CardSoundKind };
  /** When (ms after the update is shown). */
  at: number;
}

export interface SoundContext {
  /** Whose side "win" and "lose" are told from. */
  perspective: PlayerId;
  /** A definition's card type (the catalog). */
  typeOf(def: DefId): CardType | undefined;
  /** The numbers to look up for a card on the table now or just before the update: an evolved follower's evolve card first. */
  shownIds(id: CardId): string[];
  /** Keep to the animation's times (animations on); else everything sounds at once. */
  timed: boolean;
}

const PLAYED: Partial<Record<CardType, SfxName>> = { spell: "spell", follower: "follower", amulet: "amulet" };

/** The numbers of a card to look up: the printing, then the definition (no duplicates, none empty). */
const numbers = (...ids: (string | null | undefined)[]): string[] => [...new Set(ids.filter((id): id is string => !!id && !id.includes(":")))];

/** The sounds of an update (`skip`: the Quick play its announcement shows, which sounds as it opens). */
export function planSounds(entries: readonly LogEntry[], ctx: SoundContext, skip: CardId | null = null): SoundCue[] {
  const plan = planTimeline(entries, skip);
  const time = (at: number) => (ctx.timed ? at : 0);
  const hitAt = (id: CardId | null): number | undefined => (id !== null ? plan.hits.get(id) : undefined);
  const cues: SoundCue[] = [];
  const cue = (sfx: SfxName, at = 0, card?: SoundCue["card"]) => cues.push({ sfx, at: time(at), ...(card ? { card } : {}) });
  for (const { event, cards } of entries) {
    switch (event.type) {
      case "gameStarted":
        cue("game-start");
        break;
      case "turnStarted":
        cue("turn");
        break;
      case "deckShuffled":
        cue("shuffle");
        break;
      case "cardPlayed": {
        const sfx = PLAYED[ctx.typeOf(event.def) ?? "spell"] ?? "spell";
        cue(sfx, 0, { ids: numbers(cards[event.card]?.printing, event.def), kind: "p" });
        break;
      }
      case "attackDeclared": {
        const info = cards[event.attacker];
        const ids = numbers(...ctx.shownIds(event.attacker), info?.printing, info?.def);
        cue("attack", 0, { ids, kind: "a" });
        break;
      }
      case "damageDealt": {
        if (event.amount <= 0) break;
        const info = cards[event.target];
        const leader = info !== undefined && ctx.typeOf(info.def) === "leader";
        cue(leader ? "leader-damage" : "damage", hitAt(event.target) ?? 0);
        break;
      }
      case "leaderDefenseChanged":
        if (event.delta > 0) cue("heal");
        break;
      case "statsGained":
        if (event.attack > 0 || event.defense > 0) cue("buff", hitAt(event.card) ?? 0);
        break;
      case "evolved":
        cue(event.superEvolved ? "super-evolve" : "evolve");
        break;
      case "countersChanged":
        cue("counter");
        break;
      case "cardsMoved":
        for (const move of event.moves) {
          // A card hit on its way out sounds as it leaves (animation/plan.ts).
          const struck = hitAt(move.card);
          const leaves = struck !== undefined ? struck + TIMING.leave : 0;
          if (move.reason === "draw" && move.to.zone === "hand") cue("draw");
          else if (move.card === null && move.from === null) cue("token");
          else if (move.reason === "destroy" && move.from?.zone === "field") {
            const follower = (move.before?.type ?? ctx.typeOf(move.def)) === "follower";
            const ids = move.card !== null ? numbers(...ctx.shownIds(move.card), move.printing, move.def) : numbers(move.printing, move.def);
            cue("destroy", leaves, follower ? { ids, kind: "d" } : undefined);
          } else if (move.reason === "banish") cue("banish", leaves);
          else if (move.reason === "discard") cue("discard");
          else if (move.from?.zone === "field" && move.to.zone === "hand") cue("bounce", leaves);
        }
        break;
      case "gameEnded":
        if (event.result.winner !== null) cue(event.result.winner === ctx.perspective ? "win" : "lose");
        break;
      default:
        break;
    }
  }
  if (plan.selections.length > 0) cue("target", Math.min(...plan.selections.map((s) => s.at)));
  return cues;
}
