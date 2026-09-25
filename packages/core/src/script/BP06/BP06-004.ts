// BP06-004 Greenbrier Elf — Forestcraft follower, 2, 2/3. エルフ族.
// {[fanfare]} Banish a Pixie token from your EX area: Look at the top 4 cards of your deck. You may
// reveal a {[forestcraft]} card from among them and add it to your hand. Put the rest on the bottom
// of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { banishFromYourEx } from "../costs";
import { and, hasTrait, isClass, isToken } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYourEx(and(isToken, hasTrait("妖精"))),
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: isClass("Forestcraft"), to: "hand" });
      },
    }),
  ],
});
