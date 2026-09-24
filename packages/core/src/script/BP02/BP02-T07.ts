// BP02-T07 Draconic Weapon — Dragoncraft amulet token, 1.
// {[act]}{[engage]}, put this card into its owner's cemetery: Select a {[dragoncraft]} follower on
// your field. Give it {[defense]}+1 and the Armed trait. (Gaining a trait adds it to the card's
// traits — ruling; CR 2.4, 10.9.1.3.)
import { activated, defineCard } from "../helpers";
import { isClass, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: isClass("Dragoncraft") })],
        *resolve(fx) {
          const card = fx.targets[0]![0]!;
          yield* fx.giveStats(card, 0, 1);
          yield* fx.giveTrait(card, "武装");
        },
      },
    ),
  ],
});
