// BP15-075 Whimsical Mermaid — Dragoncraft follower, 2, 2/3. 海洋.
// Ward.
// {[lastwords]} Select a Marine follower in your cemetery not named Whimsical Mermaid and put it into your EX area.
import { defineCard, lastWords } from "../helpers";
import { and, inYourZone, isFollower, named } from "../targets";
import { marine } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      targets: [inYourZone("cemetery", { filter: (g, id) => and(isFollower, marine)(g, id) && !named("Whimsical Mermaid")(g, id) })],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
