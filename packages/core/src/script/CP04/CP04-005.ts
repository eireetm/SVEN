// CP04-005 Shiori — Forestcraft follower, 2, 2/2. プリコネ・エリザベスパーク.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select a PriConne follower on your field and refresh it. For the rest of this turn, it can't attack enemies.
// (Neither followers nor leaders — ruling; it may select itself.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { priconne } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [yourFollower({ filter: priconne })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.refresh([target]);
        yield* fx.cannotAttack(target, "endOfTurn");
      },
    }),
  ],
});
