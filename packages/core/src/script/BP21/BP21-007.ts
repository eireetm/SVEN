// BP21-007 Cynthia, Chivalrous Elf — Forestcraft follower, 3, 4/2. エルフ族.
// Rush. Assail.
// {[fanfare]} Choose 1. (1) Select up to 2 Pixie token followers in your EX area or on your field, and give them
// {[attack]}+1/{[defense]}+1. (2) Summon 2 Fairy tokens.
import { defineCard, fanfare } from "../helpers";
import { yourFieldOrEx } from "../targets";
import { FAIRY, pixieTokenFollower } from "./shared";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      modes: [
        {
          id: "buff",
          label: "(1) +1/+1 to up to 2 Pixie token followers in your EX area or on your field",
          targets: [yourFieldOrEx({ count: 2, upTo: true, filter: pixieTokenFollower })],
          *resolve(fx) {
            for (const id of fx.targets[0] ?? []) yield* fx.giveStats(id, 1, 1);
          },
        },
        {
          id: "fairies",
          label: "(2) Summon 2 Fairies",
          *resolve(fx) {
            yield* fx.summon([FAIRY, FAIRY]);
          },
        },
      ],
    }),
  ],
});
