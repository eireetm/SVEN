// ECP02-061 Nana Abe [Cinderella Girl] (Evolved) — 3/3.
// On Evolve - Discard an iM@S CG card: Give your leader {[defense]}+2. Draw a card.
// On Super-Evolve - Select an enemy follower on the field. Change it into an amulet and give it "At the start of your main phase,
// deal 2 damage to your leader" and "{[act]} {[cost01]}, discard 2 cards: Bury this." (CR 5.25. Rulings: it keeps its other
// abilities (Evolve, Serve, Last Words...), can evolve, serve and race and stays an amulet; it can't attack, be attacked or take
// damage; its attack and defense aren't referenced; follower effects don't select it; it overrides a "while ... this is a follower"
// passive; once it leaves the field it is a new card.)
import { discardA } from "../costs";
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(imas),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone !== "field") return;
        yield* fx.changeType(target, "amulet");
        yield* fx.grant(target, "mainPhaseDamageYourLeader2");
        yield* fx.grant(target, "activateDiscard2Bury");
      },
    }),
  ],
});
