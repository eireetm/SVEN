// BP11-106 Quixotic Adventurer (Evolved) — Neutral follower, 5/4. 荒野・傭兵.
// {[lastwords]} You may put a Dutiful Steed, Bullet Bike, and Arcane Personnel Carrier token onto your
// field or into your EX area. (Each one onto the field, into the EX area or nowhere — ruling.)
import { defineCard, lastWords } from "../helpers";
import { BIKE, CARRIER, STEED, tokenOntoFieldOrEx } from "./shared";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        for (const name of [STEED, BIKE, CARRIER]) yield* tokenOntoFieldOrEx(fx, name);
      },
    }),
  ],
});
