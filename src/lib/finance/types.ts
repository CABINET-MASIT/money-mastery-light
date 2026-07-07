export type TxType = "revenue" | "expense";
export type WorkspaceKind = "personal" | "business" | "project";

export interface Workspace {
  id: string;
  name: string;
  kind: WorkspaceKind;
  currency: string; // ISO code or custom
  color: string; // tailwind hue token (e.g. "violet")
  createdAt: string;
  logo?: string; // base64 data URL - custom workspace logo (falls back to CMASIT)
}

export interface Transaction {
  id: string;
  workspaceId: string;
  type: TxType;
  date: string; // ISO YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  reference?: string;
  supplier?: string;
}

export const REVENUE_CATEGORIES = [
  "Vente de produits",
  "Prestations de services",
  "Paiement clients",
  "Commission",
  "Intérêts",
  "Revenus exceptionnels",
  "Transfert reçu",
  "Autres revenus",
] as const;

export const EXPENSE_CATEGORIES = [
  "Salaire",
  "Transport",
  "Loyer",
  "Électricité",
  "Internet",
  "Achat de marchandises",
  "Fournitures de bureau",
  "Marketing",
  "Impôts et taxes",
  "Maintenance",
  "Transfert émis",
  "Autres dépenses",
] as const;

export const PAYMENT_METHODS = [
  "Espèces",
  "Virement bancaire",
  "Mobile Money",
  "Chèque",
  "Carte bancaire",
] as const;

export interface CurrencyDef {
  code: string;
  label: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: "GNF", label: "Franc guinéen", symbol: "GNF", locale: "fr-GN" },
  { code: "XOF", label: "Franc CFA (UEMOA)", symbol: "FCFA", locale: "fr-FR" },
  { code: "XAF", label: "Franc CFA (CEMAC)", symbol: "FCFA", locale: "fr-FR" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "fr-FR" },
  { code: "USD", label: "Dollar US", symbol: "$", locale: "en-US" },
  { code: "MAD", label: "Dirham marocain", symbol: "MAD", locale: "fr-MA" },
  { code: "NGN", label: "Naira nigérian", symbol: "₦", locale: "en-NG" },
  { code: "CDF", label: "Franc congolais", symbol: "FC", locale: "fr-CD" },
  { code: "GHS", label: "Cedi ghanéen", symbol: "₵", locale: "en-GH" },
  { code: "GBP", label: "Livre sterling", symbol: "£", locale: "en-GB" },
  { code: "CAD", label: "Dollar canadien", symbol: "CA$", locale: "fr-CA" },
];
