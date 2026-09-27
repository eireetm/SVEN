import type { Universe } from "../model/card";

/**
 * CR 2.12.2.1 — universe information is printed with the collector number (e.g. "CP03-072 2024 カードファイト!!
 * ヴァンガード"); the scraped data has no field for it, so it comes from the set. A card printed in several sets has
 * the universe of its printings in these sets (promotional reprints, e.g. PR-052 Carrot, carry no set universe).
 */
/**
 * CR 14.3.1 — the card name of every Magical Item token (Cute Earrings, Cool Pendant, … are alternate names, 14.3.1.1;
 * CP02-T01 ruling Q3). Lesson (X) banishes cards with this name from the EX area (14.3.2.1).
 */
export const MAGICAL_ITEM = "Magical Item";

export const UNIVERSE_OF_SET: Readonly<Record<string, Universe>> = {
  // CR 14.2 Umamusume: Pretty Derby
  CP01: "umamusume",
  ECP01: "umamusume",
  CSD01: "umamusume",
  // CR 14.3 THE IDOLM@STER CINDERELLA GIRLS
  CP02: "cinderellaGirls",
  ECP02: "cinderellaGirls",
  CSD02a: "cinderellaGirls",
  CSD02b: "cinderellaGirls",
  CSD02c: "cinderellaGirls",
  // CR 14.4 Cardfight!! Vanguard
  CP03: "vanguard",
  CSD03a: "vanguard",
  CSD03b: "vanguard",
  // CR 14.5 Princess Connect! Re: Dive
  CP04: "princessConnect",
  PCS01: "princessConnect",
};
