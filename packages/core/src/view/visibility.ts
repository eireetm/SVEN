import type { PlayerId } from "../model/ids";
import type { CardInstance, ZoneName } from "../model/state";

/**
 * CR 4.1.2 — who may look at a card's information.
 *  - public zones: field (4.4.2), EX area (4.8.2), cemetery (4.9.2), evolve zone (4.12.2),
 *    leader area (4.3.2), resolution zone (4.11.2), race zone (4.13.2), drive zone (4.14.2),
 *    Trigger zone (4.15.2), equipment zone (4.16.2);
 *  - banished zone: faceup cards are public (4.10.2);
 *  - hand: its owner only (4.7.2);
 *  - evolve deck area: its owner (4.6.2), plus faceup cards for everyone (4.2.3.1);
 *  - deck: nobody (4.5.2).
 */
export function zoneVisibleTo(zone: ZoneName, zonePlayer: PlayerId, viewer: PlayerId, faceUp: boolean): boolean {
  switch (zone) {
    case "field":
    case "ex":
    case "cemetery":
    case "evolveZone":
    case "leader":
    case "resolution":
    case "raceZone":
    case "driveZone":
    case "triggerZone":
    case "equipmentZone":
      return true;
    case "banished":
      return faceUp || viewer === zonePlayer;
    case "hand":
      return viewer === zonePlayer;
    case "evolveDeck":
      return faceUp || viewer === zonePlayer;
    case "deck":
      return false;
  }
}

export function cardVisibleTo(card: CardInstance, viewer: PlayerId): boolean {
  return zoneVisibleTo(card.zone, card.controller, viewer, card.faceUp);
}
