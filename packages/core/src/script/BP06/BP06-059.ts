// BP06-059 Wyrm God of the Skies — Dragoncraft follower, 4, 4/4. ドラゴニュート・竜族.
// This card can only be played from hand. (Putting it onto the field is not playing — ruling.)
// {[evolve]} {[cost01]}: Evolve this follower.
// {[act]} {[cost02]}, bury this card from your EX area: Select a follower on your field and give it
// {[attack]}+4/{[defense]}+4. For the rest of this turn, it can't attack enemies. (Valid in the EX
// area — ruling, CR 10.3.5; a follower that has attacked may be chosen.)
import { activated, defineCard, evolveAbility } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  playableIf: (g, self) => g.card(self)?.zone === "hand",
  abilities: [
    evolveAbility(1),
    activated(
      { playPoints: 2, burySelf: true },
      {
        validIn: ["ex"],
        targets: [yourFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveStats(target, 4, 4);
          yield* fx.cannotAttack(target, "endOfTurn");
        },
      },
    ),
  ],
});
