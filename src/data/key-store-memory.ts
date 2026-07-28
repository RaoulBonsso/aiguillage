import type { ApiKeyRecord, KeyStore, UsageEntry } from "@/domain/ports";

/**
 * Stockage en mémoire des clés et du journal d'usage.
 *
 * C'est l'implémentation par défaut : elle rend la démonstration et les tests
 * autonomes, sans base à provisionner. Elle ne survit pas au redémarrage du
 * processus — c'est assumé, et c'est précisément pourquoi elle est isolée
 * derrière `KeyStore` : y substituer un stockage durable ne demande qu'une
 * nouvelle classe, aucune modification du domaine.
 */
export class InMemoryKeyStore implements KeyStore {
  private readonly cles = new Map<string, ApiKeyRecord>();
  private readonly journal: UsageEntry[] = [];

  /** Au-delà, on oublie les plus anciens : un journal de démo ne doit pas fuir. */
  private readonly plafondJournal = 500;

  async create(record: ApiKeyRecord): Promise<void> {
    this.cles.set(record.id, { ...record });
  }

  async findById(id: string): Promise<ApiKeyRecord | null> {
    const trouve = this.cles.get(id);
    return trouve ? { ...trouve } : null;
  }

  async findByPrefix(prefix: string): Promise<ApiKeyRecord[]> {
    return [...this.cles.values()]
      .filter((record) => record.prefix === prefix)
      .map((record) => ({ ...record }));
  }

  async update(record: ApiKeyRecord): Promise<void> {
    this.cles.set(record.id, { ...record });
  }

  async all(): Promise<ApiKeyRecord[]> {
    return [...this.cles.values()]
      .map((record) => ({ ...record }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async appendUsage(entry: UsageEntry): Promise<void> {
    this.journal.unshift({ ...entry });
    if (this.journal.length > this.plafondJournal) {
      this.journal.length = this.plafondJournal;
    }
  }

  async recentUsage(keyId?: string, limit = 50): Promise<UsageEntry[]> {
    return this.journal
      .filter((entree) => keyId === undefined || entree.key_id === keyId)
      .slice(0, limit)
      .map((entree) => ({ ...entree }));
  }
}
