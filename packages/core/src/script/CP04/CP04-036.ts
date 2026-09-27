// CP04-036 Princess Strike — Swordcraft spell, 3. プリコネ・美食殿.
// When playing this, engage a follower on your field with "Pecorine" in its name: This costs 3 less to play. (CR 10.4.7.3; a
// reserved one, 10.4.6.)
// Select an enemy follower on the field. Deal 5 damage to it and 2 damage to its leader.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { enemyFollower, nameIncludes } from "../targets";

const reservedPecorines = (g: GameReader, c: PlayerId): CardId[] =>
  g.followers(c).filter((id) => g.card(id)?.engaged === false && nameIncludes("Pecorine")(g, id));

export default defineCard({
  playOptions: [
    {
      id: "pecorine",
      label: "Engage a Pecorine follower: 3 less",
      canPay: (g, c) => reservedPecorines(g, c).length > 0,
      *pay(fx) {
        yield* fx.engage(yield* fx.chooseCards(reservedPecorines(fx.game, fx.controller), 1, 1));
      },
      costDelta: -3,
    },
  ],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamages([
          { target, amount: 5 },
          { target: leader, amount: 2 },
        ]);
      },
    }),
  ],
});
