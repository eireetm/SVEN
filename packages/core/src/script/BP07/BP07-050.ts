// BP07-050 Presto Chango — Runecraft spell, 2. 魔法使い.
// Select an enemy card on the field and put it on the bottom of its owner's deck. Its controller may
// summon a follower or amulet from their hand. (A token is removed from the game, CR 9.1.4.
// Abilities triggered meanwhile wait until the spell has resolved — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyCardOnField, isAmulet, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyCardOnField()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const c = fx.game.card(target);
        if (c?.zone !== "field") return;
        const player = c.controller;
        yield* fx.putOnDeck([target], "bottom");
        const options = fx.game.cards(player, "hand").filter((id) => isFollower(fx.game, id) || isAmulet(fx.game, id));
        const [chosen] = yield* fx.chooseCards(options, 0, 1, player);
        if (chosen !== undefined) yield* fx.putOntoField([chosen], player);
      },
    }),
  ],
});
