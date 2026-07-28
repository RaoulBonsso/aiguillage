/**
 * Les types du domaine, calqués sur les schémas de `spec/openapi.yaml`.
 *
 * La spec reste la source de vérité : ces types en sont la projection en
 * TypeScript, et les tests de contrat vérifient que la projection n'a pas
 * dérivé. On garde volontairement le `snake_case` des champs JSON — renommer
 * à la frontière ferait mentir le code sur ce qui circule réellement.
 */

export type StationCode = string;

export type Station = {
  code: StationCode;
  name: string;
  city: string;
  country: string;
};

export type FareCode = "eco" | "semi_flex" | "flex";

export type Money = {
  amount_cents: number;
  currency: string;
};

export type Fare = {
  code: FareCode;
  price: Money;
  exchangeable: boolean;
  refundable: boolean;
  conditions: string;
};

export type Segment = {
  train_number: string;
  carrier: string;
  origin: StationCode;
  destination: StationCode;
  departure: string;
  arrival: string;
};

export type AvailabilityStatus = "available" | "limited" | "sold_out";

export type Availability = {
  status: AvailabilityStatus;
  seats_remaining: number;
};

export type Offer = {
  id: string;
  origin: StationCode;
  destination: StationCode;
  departure: string;
  arrival: string;
  duration_minutes: number;
  segments: Segment[];
  fares: Fare[];
  availability: Availability;
  updated_at: string;
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type Page<T> = {
  data: T[];
  meta: PageMeta;
};
