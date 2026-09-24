// BP05-055 Apostle of Disdain — Dragoncraft follower, 3, 2/4. 絶傑・竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// During your turn, whenever this follower takes ability damage, give it {[attack]}+1 and Storm.
import { defineCard, evolveAbility } from "../helpers";
import { disdainfulRage } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), disdainfulRage],
});
