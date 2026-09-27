// CP04-018 Aurora Healing — Forestcraft spell, 1. プリコネ・美食殿.
// Select a PriConne follower on your field and refresh it. For the rest of this turn, it can't attack enemies. If it costs 1, draw
// a card. (元のコスト. A reserved one can be selected: then only the rest happens — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { costs, priconne } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: priconne })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.refresh([target]);
        yield* fx.cannotAttack(target, "endOfTurn");
        if (fx.game.card(target) !== undefined && costs(1)(fx.game, target)) yield* fx.draw(1);
      },
    }),
  ],
});
