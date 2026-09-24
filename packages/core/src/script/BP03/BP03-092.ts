// BP03-092 Diamond Master (Evolved) — Havencraft, 4/7.
// On Evolve: Select a follower with Storm or Ward costing 3 or less in your cemetery and put it
// onto your field. Granted keywords in the cemetery do not count (ruling). Either keyword is enough.
// Same "must select this" ability as the base, only while it is a legal target.
import { defineCard, onEvolve } from "../helpers";
import { inYourZone, isFollower } from "../targets";

const stormOrWard = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) => {
  const k = g.info(id).keywords;
  return isFollower(g, id) && (g.info(id).cost ?? 99) <= 3 && (k.includes("storm") || k.includes("ward"));
};

export default defineCard({
  mustBeSelected: true,
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: stormOrWard })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0] ?? []);
      },
    }),
  ],
});
