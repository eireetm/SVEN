// BP07-007 Send 'Em Packing — Forestcraft spell, 0. 自然・獣.
// Select a Ladica, the Stoneclaw on your field and give it {[attack]} +1/{[defense]}+1. Combo (5) -
// Deal damage equal to its attack to each enemy follower on the field. (CR 13.2.1: this card counts.)
import { defineCard, spell } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: named("Ladica, the Stoneclaw") })],
      *resolve(fx) {
        const ladica = fx.targets[0]![0]!;
        yield* fx.giveStats(ladica, 1, 1);
        if (!fx.game.combo(fx.controller, 5) || fx.game.card(ladica)?.zone !== "field") return;
        const attack = fx.game.info(ladica).attack ?? 0;
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), attack);
      },
    }),
  ],
});
