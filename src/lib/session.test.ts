import { describe, expect, it } from "vitest";
import { creerJeton, verifierJeton, DUREE_SESSION_MS } from "@/lib/session";

/**
 * Une session d'administration est un pouvoir : créer et révoquer des clés
 * d'accès à l'API. On vérifie donc les trois choses qui comptent — un jeton
 * valide passe, un jeton modifié est rejeté, un jeton périmé est rejeté.
 */

const MAINTENANT = new Date("2026-07-28T10:00:00Z");

describe("jeton de session", () => {
  it("accepte un jeton qu'il vient d'émettre", () => {
    const jeton = creerJeton(MAINTENANT);

    expect(verifierJeton(jeton, MAINTENANT)).toBe(true);
  });

  it("rejette un jeton dont la signature ne correspond plus", () => {
    const jeton = creerJeton(MAINTENANT);
    const [echeance, signature] = jeton.split(".");

    // On rallonge l'échéance sans pouvoir resigner : c'est exactement la
    // tentative que la signature doit rendre inutile.
    const rallonge = `${Number(echeance) + 86_400_000}.${signature}`;

    expect(verifierJeton(rallonge, MAINTENANT)).toBe(false);
  });

  it("rejette un jeton dont la signature est bricolée", () => {
    const [echeance] = creerJeton(MAINTENANT).split(".");

    expect(verifierJeton(`${echeance}.00000000`, MAINTENANT)).toBe(false);
  });

  it("rejette un jeton périmé", () => {
    const jeton = creerJeton(MAINTENANT);
    const plusTard = new Date(MAINTENANT.getTime() + DUREE_SESSION_MS + 1000);

    expect(verifierJeton(jeton, plusTard)).toBe(false);
  });

  it("rejette ce qui n'a pas la forme d'un jeton", () => {
    expect(verifierJeton("", MAINTENANT)).toBe(false);
    expect(verifierJeton("nimportequoi", MAINTENANT)).toBe(false);
    expect(verifierJeton("...", MAINTENANT)).toBe(false);
  });
});
