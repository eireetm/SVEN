// SD01-006 Fairy Caster — Forestcraft follower, 4, 3/3. エルフ族.
// {[fanfare]} Summon 3 Fairy tokens. If your field becomes full from this effect, put any remaining tokens into your EX area.
// (Only as many as fit into the field and the EX area are made — ruling.)
import { defineCard, fanfare } from "../helpers";
import { FAIRY } from "../BP13/shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FAIRY, FAIRY, FAIRY], { overflowToEx: true });
      },
    }),
  ],
});
