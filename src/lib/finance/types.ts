export type TxType = "revenue" | "expense";

export interface Transaction {
  id: string;
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
  "Autres dépenses",
] as const;

export const PAYMENT_METHODS = [
  "Espèces",
  "Virement bancaire",
  "Mobile Money",
  "Chèque",
  "Carte bancaire",
] as const;
