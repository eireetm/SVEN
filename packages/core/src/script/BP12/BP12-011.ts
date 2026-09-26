// BP12-011 Aria's Whirlwind — Forestcraft spell, 4. 妖精・プリンセス.
// This card costs 1 less to play if there's a follower with both the Pixie and Princess traits in your
// EX area. (Both on one follower — ruling.)
// ----------
// Select a Pixie token on your field and deal damage equal to its attack to each enemy follower on the
// field.
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isFollower, yourCardOnField } from "../targets";
import { pixie, pixieToken } from "./shared";

const pixiePrincess = and(isFollower, pixie, hasTrait("プリンセス"));

export default defineCard({
  playCost: (g, _self, controller) => (g.cards(controller, "ex").some((id) => pixiePrincess(g, id)) ? -1 : 0),
  abilities: [
    spell({
      targets: [yourCardOnField({ filter: pixieToken })],
      *resolve(fx) {
        const token = fx.targets[0]![0]!;
        if (fx.game.card(token)?.zone !== "field") return;
        const attack = fx.game.info(token).attack ?? 0;
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), attack);
      },
    }),
  ],
});
