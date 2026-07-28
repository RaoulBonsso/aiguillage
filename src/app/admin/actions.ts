"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiKeys } from "@/lib/api-context";
import {
  creerJeton,
  DUREE_SESSION_MS,
  motDePasseValide,
  NOM_COOKIE,
  verifierJeton,
} from "@/lib/session";

/**
 * Les actions de la console.
 *
 * Chacune revérifie la session côté serveur. Cacher un bouton dans l'interface
 * n'a jamais empêché personne d'appeler l'action : la seule garde qui compte
 * est celle qui s'exécute ici.
 */

export type EtatConnexion = { erreur?: string };
export type EtatCreation = { erreur?: string; secret?: string; nom?: string };

/** Rejette vers l'écran de connexion si la session est absente ou invalide. */
export async function exigerSession(): Promise<void> {
  const jeton = (await cookies()).get(NOM_COOKIE)?.value ?? "";
  if (!verifierJeton(jeton)) {
    redirect("/admin/login");
  }
}

export async function sessionOuverte(): Promise<boolean> {
  const jeton = (await cookies()).get(NOM_COOKIE)?.value ?? "";
  return verifierJeton(jeton);
}

export async function connexion(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const saisi = String(donnees.get("motdepasse") ?? "");

  if (!motDePasseValide(saisi)) {
    return { erreur: "Mot de passe incorrect." };
  }

  (await cookies()).set(NOM_COOKIE, creerJeton(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DUREE_SESSION_MS / 1000,
  });

  redirect("/admin");
}

export async function deconnexion(): Promise<void> {
  (await cookies()).delete(NOM_COOKIE);
  redirect("/admin/login");
}

export async function creerCle(
  _precedent: EtatCreation,
  donnees: FormData,
): Promise<EtatCreation> {
  await exigerSession();

  const nom = String(donnees.get("nom") ?? "").trim();
  const quota = Number(donnees.get("quota") ?? 0);

  if (nom.length < 2) {
    return { erreur: "Donnez un nom reconnaissable à la clé (au moins 2 caractères)." };
  }
  if (!Number.isInteger(quota) || quota < 1 || quota > 1_000_000) {
    return { erreur: "Le quota doit être un entier entre 1 et 1 000 000." };
  }

  const { secret } = await (await apiKeys()).issue({ name: nom, quota });
  revalidatePath("/admin");

  // Le secret ne repassera jamais par ici : c'est le seul instant où il est
  // lisible, et l'interface le dit explicitement à l'administrateur.
  return { secret, nom };
}

export async function revoquerCle(donnees: FormData): Promise<void> {
  await exigerSession();

  const id = String(donnees.get("id") ?? "");
  if (id) {
    await (await apiKeys()).revoke(id);
    revalidatePath("/admin");
  }
}
