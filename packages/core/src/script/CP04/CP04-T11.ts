// CP04-T11 Dark Axe Nachtfang — Abysscraft equipment token, 2. プリコネ・ディアボロス.
// The equipped follower has "Whenever this deals ability damage to 1 or more enemy followers on the field, deal 3 damage to each
// enemy leader." (Once for damage dealt at the same time; lost with the follower's abilities — rulings.)
// (Place this beneath the equipped follower.)
import { defineCard } from "../helpers";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  equipment: {
    abilities: [
      {
        kind: "automatic",
        timing: "other",
        trigger: (e, me, g) =>
          !me.lookBack &&
          e.type === "damageDealt" &&
          e.batch !== undefined &&
          e.batch.some((d) => {
            const t = g.card(d.target);
            return d.source === me.card && d.kind === "ability" && t?.zone === "field" && t.controller !== me.controller;
          }),
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 3);
        },
      },
    ],
  },
});
