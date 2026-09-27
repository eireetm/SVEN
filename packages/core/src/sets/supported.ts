/**
 * Sets whose cards are built into definitions (`npm run build:cards`), in the order support
 * was added. The earlier set wins a card's canonical printing, so append new sets at the end:
 * existing definition ids (and script file names) then never change.
 */
export const SUPPORTED_SETS = ["BP01", "BP02", "BP03", "BP04", "BP05", "BP06", "BP07", "BP08", "BP09", "BP10", "BP11", "BP12", "BP13", "BP14", "BP15", "BP16", "BP17", "BP18", "BP19", "BP20", "BP21", "CP01"] as const;

export type SupportedSet = (typeof SUPPORTED_SETS)[number];
