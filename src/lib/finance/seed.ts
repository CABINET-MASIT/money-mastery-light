import { Transaction } from "./types";

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - offset);
  return dt.toISOString().slice(0, 10);
};

let i = 0;
const id = () => `seed-${++i}-${Math.random().toString(36).slice(2, 7)}`;

export const SEED_TRANSACTIONS: Transaction[] = [
  // Today
  { id: id(), type: "revenue", date: d(0), amount: 850000, category: "Vente de produits", description: "Vente lot textile boutique centre", paymentMethod: "Mobile Money", reference: "FAC-2026-118" },
  { id: id(), type: "revenue", date: d(0), amount: 450000, category: "Prestations de services", description: "Audit comptable client SARL Diallo", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(0), amount: 120000, category: "Transport", description: "Carburant véhicules livraison", paymentMethod: "Espèces", supplier: "Total Energies" },
  { id: id(), type: "expense", date: d(0), amount: 75000, category: "Fournitures de bureau", description: "Cartouches imprimante + ramettes", paymentMethod: "Carte bancaire", supplier: "Bureau Plus" },

  // Last 7 days
  { id: id(), type: "revenue", date: d(1), amount: 1250000, category: "Vente de produits", description: "Commande grossiste Madina", paymentMethod: "Virement bancaire", reference: "FAC-2026-117" },
  { id: id(), type: "expense", date: d(1), amount: 350000, category: "Achat de marchandises", description: "Réapprovisionnement stock", paymentMethod: "Virement bancaire", supplier: "Import Conakry SA" },
  { id: id(), type: "revenue", date: d(2), amount: 320000, category: "Commission", description: "Commission apporteur d'affaires Q2", paymentMethod: "Mobile Money" },
  { id: id(), type: "expense", date: d(2), amount: 180000, category: "Marketing", description: "Campagne publicitaire Facebook", paymentMethod: "Carte bancaire" },
  { id: id(), type: "revenue", date: d(3), amount: 680000, category: "Prestations de services", description: "Formation équipe client", paymentMethod: "Chèque" },
  { id: id(), type: "expense", date: d(3), amount: 95000, category: "Internet", description: "Abonnement fibre pro mensuel", paymentMethod: "Virement bancaire", supplier: "Orange Guinée" },
  { id: id(), type: "expense", date: d(4), amount: 220000, category: "Électricité", description: "Facture EDG juin", paymentMethod: "Espèces", supplier: "EDG" },
  { id: id(), type: "revenue", date: d(4), amount: 540000, category: "Paiement clients", description: "Règlement créance Mme Camara", paymentMethod: "Mobile Money" },
  { id: id(), type: "expense", date: d(5), amount: 1500000, category: "Salaire", description: "Salaires équipe juin", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(5), amount: 800000, category: "Loyer", description: "Loyer bureau juin", paymentMethod: "Virement bancaire", supplier: "SCI Kaloum" },
  { id: id(), type: "revenue", date: d(6), amount: 920000, category: "Vente de produits", description: "Vente détail boutique", paymentMethod: "Espèces" },
  { id: id(), type: "expense", date: d(6), amount: 60000, category: "Maintenance", description: "Réparation climatiseur bureau", paymentMethod: "Espèces" },

  // Earlier this month
  { id: id(), type: "revenue", date: d(8), amount: 1100000, category: "Vente de produits", description: "Vente événement promotion", paymentMethod: "Mobile Money" },
  { id: id(), type: "revenue", date: d(10), amount: 380000, category: "Intérêts", description: "Intérêts compte épargne entreprise", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(10), amount: 410000, category: "Impôts et taxes", description: "TVA mensuelle", paymentMethod: "Virement bancaire" },
  { id: id(), type: "revenue", date: d(12), amount: 250000, category: "Revenus exceptionnels", description: "Remboursement assurance", paymentMethod: "Chèque" },
  { id: id(), type: "expense", date: d(14), amount: 140000, category: "Transport", description: "Location véhicule mission", paymentMethod: "Carte bancaire" },

  // Last month
  { id: id(), type: "revenue", date: d(35), amount: 2200000, category: "Vente de produits", description: "Gros contrat mai", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(35), amount: 1500000, category: "Salaire", description: "Salaires mai", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(36), amount: 800000, category: "Loyer", description: "Loyer mai", paymentMethod: "Virement bancaire" },
  { id: id(), type: "revenue", date: d(40), amount: 1300000, category: "Prestations de services", description: "Mission conseil mai", paymentMethod: "Chèque" },
  { id: id(), type: "expense", date: d(45), amount: 450000, category: "Achat de marchandises", description: "Stock mai", paymentMethod: "Virement bancaire" },

  // 2 months ago
  { id: id(), type: "revenue", date: d(65), amount: 1800000, category: "Vente de produits", description: "Ventes avril", paymentMethod: "Mobile Money" },
  { id: id(), type: "expense", date: d(65), amount: 1500000, category: "Salaire", description: "Salaires avril", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(70), amount: 800000, category: "Loyer", description: "Loyer avril", paymentMethod: "Virement bancaire" },
  { id: id(), type: "revenue", date: d(72), amount: 600000, category: "Commission", description: "Commission avril", paymentMethod: "Espèces" },

  // 3 months ago
  { id: id(), type: "revenue", date: d(95), amount: 2400000, category: "Vente de produits", description: "Ventes mars", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(95), amount: 1500000, category: "Salaire", description: "Salaires mars", paymentMethod: "Virement bancaire" },
  { id: id(), type: "expense", date: d(100), amount: 280000, category: "Marketing", description: "Campagne digitale mars", paymentMethod: "Carte bancaire" },
  { id: id(), type: "revenue", date: d(105), amount: 950000, category: "Prestations de services", description: "Audit mars", paymentMethod: "Chèque" },
];
