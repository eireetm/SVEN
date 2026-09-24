// BP03-106 Bejeweled Shrine — Havencraft amulet, 1. 信仰.
// {[act]} {[cost01]}, {[engage]}: +1/+1 to a follower with Ward or Storm on your field.
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";

const stormOrWard = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) => {
  const k = g.info(id).keywords;
  return k.includes("storm") || k.includes("ward");
};

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true },
      {
        targets: [yourFollower({ filter: stormOrWard })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
  ],
});
