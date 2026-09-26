// BP13-006 Nelcha, Fashion Hazard (Evolved) — Forestcraft follower, 3/3. エルフ族・キラー.
// On Evolve - Look at the top 5 cards of your deck. You may reveal a {[forestcraft]} spell from among them
// and add it to your hand. You may also bury a {[forestcraft]} spell. Put the rest on the bottom of your
// deck in any order. (Either, both or neither — ruling.)
// Strike - Select an enemy follower on the field. If there are at least 5 {[forestcraft]} spells with
// different names in your cemetery, give it {[attack]}-2/{[defense]}-2 and give this follower {[attack]}+2/
// {[defense]}+2 (Both under the condition, as the English says; not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { forestcraftSpell, nelchaStrike } from "./shared-forest";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const top = fx.topCards(5);
        const inDeck = () => top.filter((id) => fx.game.card(id)?.zone === "deck" && forestcraftSpell(fx.game, id));
        const toHand = yield* fx.selectCards(inDeck(), 0, 1, fx.controller, top);
        yield* fx.reveal(toHand);
        yield* fx.returnToHand(toHand);
        yield* fx.bury(yield* fx.selectCards(inDeck(), 0, 1, fx.controller, top));
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    nelchaStrike,
  ],
});
