// BP03-105 Amethyst Lion — Havencraft follower, 2, 2/1. 信仰・獣.
// Storm.
// {[fanfare]} Select another follower with Storm or Ward on your field and give it +1 attack.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

const stormOrWard = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) => {
  const k = g.info(id).keywords;
  return k.includes("storm") || k.includes("ward");
};

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: stormOrWard })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
  ],
});
