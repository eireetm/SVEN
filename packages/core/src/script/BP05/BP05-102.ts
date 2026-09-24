// BP05-102 Ancient Amplifier — Havencraft amulet, 3. 偶像・超克.
// {[fanfare]} Summon a Mystic Artifact token.
// {[act]} {[cost01]}, {[engage]}, put this card into its owner's cemetery: Select a token follower
// on your field and give it {[attack]}+2/{[defense]}+1.
import { activated, defineCard, fanfare } from "../helpers";
import { isToken, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Mystic Artifact"]);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: isToken })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 2, 1);
        },
      },
    ),
  ],
});
