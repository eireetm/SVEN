// BP21-090 Spirit Invasion — Abysscraft spell, 4. 死者.
// Choose up to 2. (1) Banish an {[abysscraft]} follower from your cemetery: Select an enemy follower on the field and deal it
// damage equal to 2 times the attack of the {[abysscraft]} follower banished this way. (2) Banish a non-{[abysscraft]}
// follower from your cemetery: Select an enemy follower on the field and deal it damage equal to the attack of the
// non-{[abysscraft]} follower banished this way. (Each option once — ruling. An option "[process]: [effect]" applies only
// if its process is executed as it resolves, CR 10.4.7.5, 5.18.1; the attack is the banished card's, printed there.)
import type { CardId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, spell } from "../helpers";
import { enemyFollower, isClass, isFollower } from "../targets";

const abyss = isClass("Abysscraft");

/** Banish a matching follower from your cemetery, remembering its attack for the option's effect. */
const banishFollower = (key: string, filter: (g: GameReader, id: CardId) => boolean): CustomCost => ({
  canPay: (g, c) => g.cards(c, "cemetery").some((id) => isFollower(g, id) && filter(g, id)),
  *pay(fx) {
    const g = fx.game;
    const [card] = yield* fx.chooseCards(g.cards(fx.controller, "cemetery").filter((id) => isFollower(g, id) && filter(g, id)), 1, 1);
    if (card === undefined) return;
    fx.memory[key] = g.info(card).attack ?? 0;
    yield* fx.banish([card]);
  },
});

const damage = (fx: EffectContext, key: string, times: number) => times * Number(fx.memory[key] ?? 0);

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
      modes: [
        {
          id: "abyss",
          label: "(1) Banish an Abysscraft follower from your cemetery: 2x its attack as damage",
          cost: banishFollower("abyssAttack", abyss),
          targets: [enemyFollower()],
          *resolve(fx) {
            const amount = damage(fx, "abyssAttack", 2);
            if (amount > 0) yield* fx.dealDamage(fx.targets[0]![0]!, amount);
          },
        },
        {
          id: "other",
          label: "(2) Banish a non-Abysscraft follower from your cemetery: its attack as damage",
          cost: banishFollower("otherAttack", (g, id) => !abyss(g, id)),
          targets: [enemyFollower()],
          *resolve(fx) {
            const amount = damage(fx, "otherAttack", 1);
            if (amount > 0) yield* fx.dealDamage(fx.targets[0]![0]!, amount);
          },
        },
      ],
    }),
  ],
});
