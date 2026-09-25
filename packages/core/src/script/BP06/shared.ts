// Abilities shared by several BP06 cards (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { ActivatedAbility, CardScript, CustomCost, FieldPassives } from "../types";
import { activated, defineCard, fanfare, spell, whenCardEntersYourField } from "../helpers";
import { enemyFollower, hasTrait, isFollower, isSpell, named, yourFollower } from "../targets";

/** "your remaining play points" (e.g. BP06-091 "if you have at least 2 play points"). */
export const playPointsOf = (g: GameReader, p: PlayerId): number => g.state.players[p].playPoints;

/** Forestcraft "if there are at least 3 Hunter cards in your cemetery" (BP06-012). */
export const threeHunters = (g: GameReader, p: PlayerId): boolean =>
  g.cards(p, "cemetery").filter((id) => hasTrait("狩人")(g, id)).length >= 3;

/**
 * Runecraft "the number of spells and Onmyoji cards in your cemetery": a card that is both counts
 * once (rulings).
 */
export const onmyojiCount = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => isSpell(g, id) || hasTrait("陰陽師")(g, id)).length;

/** "If there are at least 7 spells and Onmyoji cards in your cemetery" (BP06-040, 042, 046). */
export const sevenOnmyoji = (g: GameReader, p: PlayerId): boolean => onmyojiCount(g, p) >= 7;

/** "If there is a [name] on your field". */
export const onYourField = (g: GameReader, p: PlayerId, name: string): boolean =>
  g.cards(p, "field").some((id) => named(name)(g, id));

/** "faceup evolved followers in your evolve deck" (BP06-018, 117) — not evolved amulets (ruling). */
export const faceUpEvolvedFollowers = (g: GameReader, p: PlayerId): CardId[] =>
  g.faceUpEvolveDeck(p).filter((id) => {
    const d = g.db.get(g.card(id)!.def);
    return d.evolved && d.type === "follower";
  });

/** "[engage] N [matching] followers on your field" as a cost: N reserved ones (CR 10.4.6). */
export function engageYourFollowers(n: number, filter: (g: GameReader, id: CardId) => boolean): CustomCost {
  const reserved = (g: GameReader, p: PlayerId) => g.followers(p).filter((id) => g.card(id)?.engaged === false && filter(g, id));
  return {
    canPay: (g, c) => reserved(g, c).length >= n,
    *pay(fx) {
      yield* fx.engage(yield* fx.chooseCards(reserved(fx.game, fx.controller), n, n));
    },
  };
}

/** Shikigami (式神) followers. */
export const shikigami = (g: GameReader, id: CardId): boolean => isFollower(g, id) && hasTrait("式神")(g, id);

/**
 * BP06-035 / 036 Kuon, Founder of Onmyodo (and its hololive printing Clear Intellect, Koyori
 * Hakui, a card of another name with the same text).
 */
export const kuon: CardScript = defineCard({
  // "This card costs 1 less to play for every spell and Onmyoji card in your cemetery."
  playCost: (g, _self, controller) => -onmyojiCount(g, controller),
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!onYourField(fx.game, fx.controller, "Celestial Shikigami")) yield* fx.summon(["Celestial Shikigami"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ count: 2, upTo: true, filter: shikigami })],
        *resolve(fx) {
          for (const id of fx.targets[0] ?? []) yield* fx.giveKeyword(id, "storm");
        },
      },
    ),
  ],
});

/**
 * BP06-042 / 043 Shikigami Summons (and Koyo's Big Invention, another name with the same text):
 * "Summon a Paper Shikigami token. If there are at least 7 spells and Onmyoji cards in your
 * cemetery, draw a card." (The spell itself is not in the cemetery yet.)
 */
export const shikigamiSummons: CardScript = defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Paper Shikigami"]);
        if (sevenOnmyoji(fx.game, fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});

/** BP06-044 / 045 "Whenever a Shikigami follower is put onto your field, give it {[attack]}+1 and Rush." */
export const demoncallerBoost = whenCardEntersYourField(
  {
    *resolve(fx) {
      const card = fx.data?.card;
      if (card === undefined || fx.game.card(card)?.zone !== "field") return;
      yield* fx.giveStats(card, 1, 0);
      yield* fx.giveKeyword(card, "rush");
    },
  },
  { filter: shikigami },
);

/**
 * BP06-039 / 040 "Activate — Bury a Shikigami follower: Select an enemy follower on the field and
 * deal it 4 damage. For the rest of this turn, this card's Activate abilities [except Evolve]
 * can't be activated." (Not playable without a target, so the cost isn't paid then — ruling. It
 * also stops the evolved card's ability after evolving that turn — ruling.)
 */
export function curseCrafterAbility(exceptEvolve: boolean): ActivatedAbility {
  const buryShikigami: CustomCost = {
    canPay: (g, c) => g.followers(c).some((id) => shikigami(g, id)),
    *pay(fx) {
      const cards = fx.game.followers(fx.controller).filter((id) => shikigami(fx.game, id));
      yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
    },
  };
  return activated(
    { custom: buryShikigami },
    {
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.cantActivate(fx.self, exceptEvolve, "endOfTurn");
      },
    },
  );
}

/**
 * BP06-056 / 057 Filene, Whitefrost Dragonewt (and Blue Sea Predator, Chloe Sakamata, another name
 * with the same text).
 */
export const filene: CardScript = defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        // Already engaged: it still doesn't refresh (ruling).
        const target = fx.targets[0]![0]!;
        yield* fx.engage([target]);
        yield* fx.skipNextRefresh(target);
      },
    }),
    fanfare({
      *resolve(fx) {
        // The deck is searched and shuffled even without one (ruling).
        if (fx.game.overflow(fx.controller)) yield* fx.search((id) => named("Whitefrost Whisper")(fx.game, id), { to: "ex" });
      },
    }),
  ],
});

/**
 * BP06-061 / 062 Whitefrost Whisper (and I'll Clean You Up♡, another name with the same text):
 * costs 1 less with Overflow; destroy an engaged enemy follower, and 2 damage to its leader with
 * Filene, Whitefrost Dragonewt on your field (not without a target — ruling).
 */
export const whitefrostWhisper: CardScript = defineCard({
  playCost: (g, _self, controller) => (g.overflow(controller) ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower({ filter: (g, id) => g.card(id)?.engaged === true })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        if (onYourField(fx.game, fx.controller, "Filene, Whitefrost Dragonewt")) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});

/** BP06-037 / 038 "While this card is on your field, any Academic follower you play costs 1 less." */
export const academicDiscount: FieldPassives = {
  playCostOf: (g, self, card, player) => (player === g.controller(self) && isFollower(g, card) && hasTrait("学院")(g, card) ? -1 : 0),
};

/**
 * BP06-091 / 092 "... if you have at least 2 play points, deal 2 damage to each enemy leader. If you
 * have at least 4, draw a card. If you have at least 6, [destroy the selected follower]." Each part
 * counts the play points when it happens; the follower was selected when the ability was played
 * (rulings).
 */
export function* karulaStrikes(fx: EffectContext): Proc<void> {
  const pp = () => playPointsOf(fx.game, fx.controller);
  if (pp() >= 2) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
  if (pp() >= 4) yield* fx.draw(1);
  if (pp() >= 6) yield* fx.destroy(fx.targets[0] ?? []);
}

/** "Look at the top N cards of your deck ... Bury the rest." (BP06-010) */
export function* buryTheRest(fx: EffectContext, top: readonly CardId[]): Proc<void> {
  yield* fx.bury(top.filter((id) => fx.game.card(id)?.zone === "deck"));
}
