// BP09-077 Big Soul Hunter (Evolved) — Abysscraft follower, 4/5. 死霊術師・キラー.
// On Evolve - Each opponent buries a follower with the highest attack among followers on their field.
// (That player picks among ties; it is not a "select", so Aura doesn't stop it, and burying is not
// destroying — rulings.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        const followers = fx.game.followers(opp);
        if (followers.length === 0) return;
        const attack = (id: string) => fx.game.info(id).attack ?? 0;
        const highest = Math.max(...followers.map(attack));
        const top = followers.filter((id) => attack(id) === highest);
        yield* fx.bury(top.length === 1 ? top : yield* fx.chooseCards(top, 1, 1, opp));
      },
    }),
  ],
});
