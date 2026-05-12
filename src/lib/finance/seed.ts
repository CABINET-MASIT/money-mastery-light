import { Transaction } from "./types";

export const DEFAULT_WORKSPACE_ID = "ws-personal";

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - offset);
  return dt.toISOString().slice(0, 10);
};

let i = 0;
const id = () => `seed-${++i}-${Math.random().toString(36).slice(2, 7)}`;
const w = DEFAULT_WORKSPACE_ID;

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: id(), workspaceId: w, type: "revenue", date: d(0), amount: 850000, category: "Vente de produits", description: "Vente lot textile boutique centre", paymentMethod: "Mobile Money", reference: "FAC-2026-118" },
  { id: id(), workspaceId: w, type: "revenue", date: d(0), amount: 450000, category: "Prestations de services", description: "Audit comptable client", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(0), amount: 120000, category: "Transport", description: "Carburant véhicules livraison", paymentMethod: "Espèces", supplier: "Total Energies" },
  { id: id(), workspaceId: w, type: "expense", date: d(0), amount: 75000, category: "Fournitures de bureau", description: "Cartouches imprimante + ramettes", paymentMethod: "Carte bancaire", supplier: "Bureau Plus" },
  { id: id(), workspaceId: w, type: "revenue", date: d(1), amount: 1250000, category: "Vente de produits", description: "Commande grossiste", paymentMethod: "Virement bancaire", reference: "FAC-2026-117" },
  { id: id(), workspaceId: w, type: "expense", date: d(1), amount: 350000, category: "Achat de marchandises", description: "Réapprovisionnement stock", paymentMethod: "Virement bancaire", supplier: "Import SA" },
  { id: id(), workspaceId: w, type: "revenue", date: d(2), amount: 320000, category: "Commission", description: "Commission apporteur d'affaires", paymentMethod: "Mobile Money" },
  { id: id(), workspaceId: w, type: "expense", date: d(2), amount: 180000, category: "Marketing", description: "Campagne publicitaire en ligne", paymentMethod: "Carte bancaire" },
  { id: id(), workspaceId: w, type: "revenue", date: d(3), amount: 680000, category: "Prestations de services", description: "Formation équipe client", paymentMethod: "Chèque" },
  { id: id(), workspaceId: w, type: "expense", date: d(3), amount: 95000, category: "Internet", description: "Abonnement fibre pro mensuel", paymentMethod: "Virement bancaire", supplier: "Orange" },
  { id: id(), workspaceId: w, type: "expense", date: d(4), amount: 220000, category: "Électricité", description: "Facture électricité", paymentMethod: "Espèces", supplier: "EDG" },
  { id: id(), workspaceId: w, type: "revenue", date: d(4), amount: 540000, category: "Paiement clients", description: "Règlement créance", paymentMethod: "Mobile Money" },
  { id: id(), workspaceId: w, type: "expense", date: d(5), amount: 1500000, category: "Salaire", description: "Salaires équipe", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(5), amount: 800000, category: "Loyer", description: "Loyer bureau", paymentMethod: "Virement bancaire", supplier: "SCI Kaloum" },
  { id: id(), workspaceId: w, type: "revenue", date: d(6), amount: 920000, category: "Vente de produits", description: "Vente détail boutique", paymentMethod: "Espèces" },
  { id: id(), workspaceId: w, type: "expense", date: d(6), amount: 60000, category: "Maintenance", description: "Réparation climatiseur bureau", paymentMethod: "Espèces" },
  { id: id(), workspaceId: w, type: "revenue", date: d(8), amount: 1100000, category: "Vente de produits", description: "Vente événement promotion", paymentMethod: "Mobile Money" },
  { id: id(), workspaceId: w, type: "revenue", date: d(10), amount: 380000, category: "Intérêts", description: "Intérêts compte épargne", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(10), amount: 410000, category: "Impôts et taxes", description: "TVA mensuelle", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "revenue", date: d(35), amount: 2200000, category: "Vente de produits", description: "Gros contrat", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(35), amount: 1500000, category: "Salaire", description: "Salaires", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(36), amount: 800000, category: "Loyer", description: "Loyer", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "revenue", date: d(40), amount: 1300000, category: "Prestations de services", description: "Mission conseil", paymentMethod: "Chèque" },
  { id: id(), workspaceId: w, type: "revenue", date: d(65), amount: 1800000, category: "Vente de produits", description: "Ventes mois -2", paymentMethod: "Mobile Money" },
  { id: id(), workspaceId: w, type: "expense", date: d(65), amount: 1500000, category: "Salaire", description: "Salaires", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(70), amount: 800000, category: "Loyer", description: "Loyer", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "revenue", date: d(95), amount: 2400000, category: "Vente de produits", description: "Ventes mois -3", paymentMethod: "Virement bancaire" },
  { id: id(), workspaceId: w, type: "expense", date: d(95), amount: 1500000, category: "Salaire", description: "Salaires", paymentMethod: "Virement bancaire" },
];
