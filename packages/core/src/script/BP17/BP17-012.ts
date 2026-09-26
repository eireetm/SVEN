// BP17-012 Inverted Manipulation — Forestcraft spell, 1. 人形.
// Choose 1. (1) Select a Puppetry token follower on your field and give it {[attack]}+2/{[defense]}+2. (2) Put 2 Puppet
// tokens into your EX area. ((1) needs its target — ruling.)
import { defineCard, spell } from "../helpers";
import { isToken, yourFollower } from "../targets";
import { PUPPET, puppetry } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "buff",
          label: "(1) +2/+2 to a Puppetry token follower",
          targets: [yourFollower({ filter: (g, id) => isToken(g, id) && puppetry(g, id) })],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
          },
        },
        {
          id: "puppets",
          label: "(2) 2 Puppets into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx([PUPPET, PUPPET]);
          },
        },
      ],
    }),
  ],
});
