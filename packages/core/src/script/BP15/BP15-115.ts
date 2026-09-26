// BP15-115 Arael — Neutral follower, 2, 0/1. 天使.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select a follower on your field and give {[attack]}+1/{[defense]}+1. (This one too.)
import { defineCard, evolveAbility } from "../helpers";
import { araelBlessing } from "./shared-neutral";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1), araelBlessing("fanfare")],
});
