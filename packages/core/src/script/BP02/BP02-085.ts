// BP02-085 Demonic Hedonist — Abysscraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower.
// At the start of your end phase, if Sanguine is active for you, draw a card, then discard a card.
// (Without Sanguine nothing happens, not even the discard — ruling; CR 13.5.2.)
import { defineCard, evolveAbility } from "../helpers";
import { sanguineCycle } from "./shared";

export default defineCard({ abilities: [evolveAbility(1), sanguineCycle] });
