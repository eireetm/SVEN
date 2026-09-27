// ECP02-010 Miku Maekawa [Meownderful World] — Forestcraft follower, 1, 1/1. デレマス・キュート.
// Storm.
// {[lastwords]}, Lesson (1): Search your deck for a follower with "Miku Maekawa" in its name, reveal it, add it to your hand, then
// shuffle.
import { lesson } from "../costs";
import { defineCard, lastWords } from "../helpers";
import { followerNamed } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    lastWords({
      cost: lesson(1),
      *resolve(fx) {
        yield* fx.search((id) => followerNamed("Miku Maekawa")(fx.game, id));
      },
    }),
  ],
});
