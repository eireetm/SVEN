// ECP01-008 Mihono Bourbon — Forestcraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[feed]}{[feed]} {[cost02]}: Race this follower 2 times.
// {[feed]}{[feed]}{[feed]} {[cost03]}: Race this follower 3 times.
// On Race - Select up to 1 enemy follower on the field and deal it 3 damage. Give this follower {[attack]}+1/{[defense]}+1.
// (Racing 2 times triggers On Race twice; 3 times needs 3 Carrots; once raced it can't serve again — rulings.)
import { defineCard, onRace, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { damageUpToOneThenPlusOne } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    serveAbility(2, 2),
    serveAbility(3, 3),
    onRace({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        yield* damageUpToOneThenPlusOne(fx, 3);
      },
    }),
  ],
});
