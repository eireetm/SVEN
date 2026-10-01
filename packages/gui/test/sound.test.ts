import { describe, expect, it } from "vitest";
import type { CardMove, GameEvent } from "@sve/core";
import type { LogEntry } from "../src/engine/protocol";
import { TIMING } from "../src/game/animation/plan";
import { bgmUrl, cardSoundUrl, setResourceLists, sfxUrl } from "../src/resources/lookup";
import { planSounds, SFX, type SoundContext } from "../src/resources/sound-plan";

// The sounds: which files are looked for, and which sounds an update makes, when.

const entry = (event: GameEvent, cards: LogEntry["cards"] = {}): LogEntry => ({ seq: 1, turn: 1, event, cards });
const zone = (player: 0 | 1, name: string) => ({ player, zone: name, faceUp: true }) as CardMove["to"];
const move = (card: string | null, newCard: string | null, from: CardMove["from"], to: CardMove["to"], reason: CardMove["reason"], def = "F"): CardMove => ({
  card,
  newCard,
  def,
  printing: `${def}-P`,
  owner: 0,
  from,
  to,
  reason,
  before: null,
});
const TYPES: Record<string, "follower" | "spell" | "amulet" | "leader"> = { F: "follower", S: "spell", A: "amulet", L: "leader" };
const context = (timed = true): SoundContext => ({
  perspective: 0,
  typeOf: (def) => TYPES[def],
  // f1 is an evolved follower: its evolve card first.
  shownIds: (id) => (id === "f1" ? ["EV-P", "EV", "F-P", "F"] : []),
  timed,
});

describe("sound files", () => {
  it("finds a common effect or its fallback, a card's own sound by printing then definition, and each screen's music", () => {
    setResourceLists(
      ["audio/sfx/play.mp3", "audio/sfx/damage.ogg", "audio/cards/BP01-001-a.mp3", "audio/cards/BP01-SL01-a.wav", "audio/cards/BP01-001-d.mp3", "audio/bgm/battle.mp3"],
      [],
    );
    expect(sfxUrl(["follower", ...SFX.follower])).toBe("/audio/sfx/play.mp3");
    expect(sfxUrl(["leader-damage", ...SFX["leader-damage"]])).toBe("/audio/sfx/damage.ogg");
    expect(sfxUrl(["draw", ...SFX.draw])).toBeNull();
    // An alternate art may have its own; else the card's (definition's).
    expect(cardSoundUrl(["BP01-SL01", "BP01-001"], "a")).toBe("/audio/cards/BP01-SL01-a.wav");
    expect(cardSoundUrl(["BP01-P01", "BP01-001"], "a")).toBe("/audio/cards/BP01-001-a.mp3");
    expect(cardSoundUrl(["BP01-001"], "p")).toBeNull();
    expect(bgmUrl("battle")).toBe("/audio/bgm/battle.mp3");
    expect(bgmUrl("menu")).toBeNull();
  });
});

describe("the sounds of an update", () => {
  it("draws, a follower played (its own sound first), an attack of an evolved follower, the leader hit as the attacker strikes", () => {
    const cues = planSounds(
      [
        entry({ type: "cardsMoved", moves: [move(null, "h1", zone(0, "deck"), zone(0, "hand"), "draw")] }),
        entry({ type: "cardPlayed", player: 0, card: "r1", def: "F", from: "hand" }, { r1: { def: "F", printing: "F-P" } }),
        entry({ type: "attackDeclared", player: 0, attacker: "f1", target: "l2" }, { f1: { def: "F", printing: "F-P" }, l2: { def: "L", printing: null } }),
        entry({ type: "damageDealt", source: "f1", target: "l2", amount: 2, kind: "attack", combat: false }, { l2: { def: "L", printing: null } }),
        entry({ type: "attackEnded", attacker: "f1" }),
      ],
      context(),
    );
    expect(cues).toEqual([
      { sfx: "draw", at: 0 },
      { sfx: "follower", at: 0, card: { ids: ["F-P", "F"], kind: "p" } },
      { sfx: "attack", at: 0, card: { ids: ["EV-P", "EV", "F-P", "F"], kind: "a" } },
      { sfx: "leader-damage", at: TIMING.lunge + TIMING.strike },
    ]);
  });

  it("a spell's target is hit after its arrow, and a follower destroyed sounds as it leaves (its own sound first)", () => {
    const log = [
      entry({ type: "cardPlayed", player: 1, card: "r2", def: "S", from: "hand" }, { r2: { def: "S", printing: null } }),
      entry({ type: "cardsSelected", player: 1, cards: ["f3"], source: "r2" }),
      entry({ type: "damageDealt", source: "r2", target: "f3", amount: 3, kind: "ability", combat: false }, { f3: { def: "F", printing: "F-P" } }),
      entry({ type: "cardsMoved", moves: [{ ...move("f3", "c3", zone(0, "field"), zone(0, "cemetery"), "destroy"), before: { abilityDef: "F", controller: 0, counters: {}, names: [], type: "follower" } }] }),
    ];
    const arrow = TIMING.landed + (TIMING.fromCorner - TIMING.landed);
    const hit = arrow + TIMING.strike;
    expect(planSounds(log, context())).toEqual([
      { sfx: "spell", at: 0, card: { ids: ["S"], kind: "p" } },
      { sfx: "damage", at: hit },
      { sfx: "destroy", at: hit + TIMING.leave, card: { ids: ["F-P", "F"], kind: "d" } },
      { sfx: "target", at: arrow },
    ]);
    // Animations off: everything at once.
    expect(planSounds(log, context(false)).every((cue) => cue.at === 0)).toBe(true);
    // A Quick play its announcement shows sounds as it opens (the announcement's own sound), not by its arrow.
    expect(planSounds(log, context(), "r2").some((cue) => cue.sfx === "target")).toBe(false);
  });

  it("an amulet destroyed has no card sound of its own; super-evolving, healing, tokens, the end of the game", () => {
    const cues = planSounds(
      [
        entry({ type: "cardsMoved", moves: [move("a1", "c1", zone(1, "field"), zone(1, "cemetery"), "destroy", "A"), move(null, "t1", null, zone(0, "field"), "effect")] }),
        entry({ type: "evolved", card: "f1", evolveCard: "e1", superEvolved: true }),
        entry({ type: "leaderDefenseChanged", player: 0, defense: 18, delta: 2 }),
        entry({ type: "gameEnded", result: { winner: 1, reason: "defense" } as never }),
      ],
      context(),
    );
    expect(cues.map((cue) => [cue.sfx, cue.card?.kind ?? null])).toEqual([
      ["destroy", null],
      ["token", null],
      ["super-evolve", null],
      ["heal", null],
      ["lose", null],
    ]);
  });
});
