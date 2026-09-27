import { describe } from "vitest";
import { setSmokeTests } from "./set-smoke";

describe("ECP01 whole set", () => {
  setSmokeTests("ECP01", {
    games: 40,
    extras: {
      // An Umamusume card of the Mejiro Family on the field (Sakura Laurel and the like count Umamusume cards; Mejiro Ramonu's
      // options and Bring 'Em Home, Please! count Mejiro Family cards). One more would fill the field.
      field: ["ECP01-053"],
    },
  });
});
