/**
 * Les ports du domaine : ce dont il a besoin, sans dire qui le fournit.
 *
 * Le service de clés parle à ces interfaces, jamais à une base de données. C'est
 * ce qui permet de le tester en mémoire, en millisecondes, et de brancher plus
 * tard un stockage persistant sans toucher à une seule règle métier.
 */

export type ApiKeyRecord = {
  id: string;
  name: string;
  /** Début non secret de la clé, affiché dans la console pour la reconnaître. */
  prefix: string;
  /** Empreinte SHA-256 du secret. Le secret lui-même n'est jamais stocké. */
  hash: string;
  quota: number;
  created_at: string;
  revoked_at: string | null;
  /** Consommation de la fenêtre courante, identifiée par sa période (AAAA-MM). */
  usage: { period: string; count: number };
};

/** La vue publique d'une clé : tout sauf de quoi la rejouer. */
export type ApiKeyView = Omit<ApiKeyRecord, "hash">;

export type UsageEntry = {
  key_id: string;
  operation: string;
  status: number;
  at: string;
};

export interface KeyStore {
  create(record: ApiKeyRecord): Promise<void>;
  findById(id: string): Promise<ApiKeyRecord | null>;
  /**
   * Les clés partageant ce préfixe. On cherche par préfixe et non par empreinte
   * pour que la vérification du secret reste une comparaison à temps constant,
   * faite en mémoire — une recherche indexée par empreinte déplacerait la
   * comparaison dans le moteur de stockage, hors de notre contrôle.
   */
  findByPrefix(prefix: string): Promise<ApiKeyRecord[]>;
  update(record: ApiKeyRecord): Promise<void>;
  all(): Promise<ApiKeyRecord[]>;
  appendUsage(entry: UsageEntry): Promise<void>;
  /** Les appels les plus récents d'abord. `keyId` absent = toutes clés confondues. */
  recentUsage(keyId?: string, limit?: number): Promise<UsageEntry[]>;
}

/** Une horloge injectable : le temps est une dépendance comme une autre. */
export type Clock = () => Date;
