// BP02-043 Remi & Rami, Witchy Duo (Evolved) — 4/4.
// On Evolve: Summon a Strikeform Golem token. Earth Rite: Give it {[attack]}+2.
// (Earth Rite is paid when the ability is played, before it resolves: a Stack amulet emptied by
// it leaves the field first and frees its slot — ruling; CR 13.3.3.2.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        const [golem] = yield* fx.summon(["Strikeform Golem"]);
        if (fx.earthRitePaid && golem !== undefined) yield* fx.giveStats(golem, 2, 0);
      },
    }),
  ],
});
