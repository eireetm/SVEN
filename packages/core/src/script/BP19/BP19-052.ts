// BP19-052 Outdoorsmage — Runecraft follower, 2, 2/3. 魔法使い.
// {[fanfare]} Summon a Magic Sediment token.
// {[act]} {[cost05]}, Earth Rite: Summon 3 Guardform Golem or Strikeform Golem tokens. (Any mix of 3, not fewer — ruling;
// CR 13.3.3.)
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
    activated(
      { playPoints: 5 },
      {
        earthRite: { mode: "required" },
        *resolve(fx) {
          const golems: string[] = [];
          for (let i = 0; i < 3; i++) {
            const [name] = yield* fx.choose([
              { id: "Guardform Golem", label: "A Guardform Golem" },
              { id: "Strikeform Golem", label: "A Strikeform Golem" },
            ]);
            if (name) golems.push(name);
          }
          yield* fx.summon(golems);
        },
      },
    ),
  ],
});
