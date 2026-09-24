'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, Language } from '@/i18n/translations';

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  ninea?: string;
  statut: 'actif' | 'inactif';
  commandesCount: number;
  totalDepense: number;
  soldeDu: number;
  delaiPaiement: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  clientEmail?: string;
  dateCreation: string;
  dateLivraison: string;
  creeePar: string;
  statut: 'attente' | 'confirmee' | 'preparation' | 'livree' | 'annulee';
  articles: OrderItem[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Facture {
  id: string;
  numero: string;
  commandeId?: string;
  commandeNumero?: string;
  clientId: string;
  clientNom: string;
  clientEmail?: string;
  clientAdresse?: string;
  clientSiret?: string;
  dateEmission: string;
  dateEcheance: string;
  statut: 'payee' | 'attente' | 'retard' | 'annulee';
  articles: InvoiceItem[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  montantPaye: number;
  resteDu: number;
  notes?: string;
}

export interface Paiement {
  id: string;
  reference: string;
  factureId: string;
  factureNumero: string;
  clientId: string;
  clientNom: string;
  montant: number;
  methode: 'virement' | 'carte' | 'cheque' | 'especes';
  date: string;
  statut: 'reussi' | 'attente' | 'echoue';
  notes?: string;
}

export interface Produit {
  id: string;
  nom: string;
  sku: string;
  categorie: string;
  prix: number;
  tva: number;
  stock: number;
  alerte: number;
  description?: string;
  image?: string;
  icon?: string;
  createdAt?: string;
}

export interface CompanySettings {
  companyName: string;
  siret: string;
  tva: string;
  address: string;
  zip: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  currency?: string;
  language?: string;
  dateFormat?: string;
  timezone?: string;
  defaultTva?: number;
  paymentTermsDays?: number;
}

export type ThemeMode = 'dark' | 'light';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: 'order' | 'invoice' | 'payment' | 'alert' | 'client';
  icon: string;
  iconBg: string;
  iconColor: string;
  read: boolean;
  link?: string;
}

interface StoreContextType {
  isHydrated: boolean;
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  clients: Client[];
  commandes: Commande[];
  factures: Facture[];
  paiements: Paiement[];
  produits: Produit[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  companySettings: CompanySettings;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  // Currency & Internationalization
  currencyCode: string;
  currencySymbol: string;
  formatCurrency: (amountInEUR: number, options?: { showDecimals?: boolean; compact?: boolean; forceDecimals?: number }) => string;
  convertPrice: (amountInEUR: number) => number;
  toBasePrice: (amountInSelectedCurrency: number) => number;
  t: (key: string) => string;
  // Clients CRUD
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'commandesCount' | 'totalDepense' | 'soldeDu' | 'delaiPaiement'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  getClientOrders: (clientId: string) => Commande[];
  getClientInvoices: (clientId: string) => Facture[];
  getClientPayments: (clientId: string) => Paiement[];
  // Commandes CRUD
  addCommande: (commandeData: Omit<Commande, 'id' | 'numero' | 'dateCreation'>) => Commande;
  updateCommande: (id: string, updates: Partial<Commande>) => void;
  updateCommandeStatus: (id: string, newStatus: Commande['statut']) => void;
  deleteCommande: (id: string) => void;
  getCommande: (id: string) => Commande | undefined;
  // Factures CRUD
  addFacture: (factureData: Omit<Facture, 'id' | 'numero' | 'dateEmission'>) => Facture;
  updateFacture: (id: string, updates: Partial<Facture>) => void;
  updateFactureStatus: (id: string, newStatus: Facture['statut']) => void;
  markFactureAsPaid: (id: string) => void;
  deleteFacture: (id: string) => void;
  getFacture: (id: string) => Facture | undefined;
  // Paiements CRUD
  addPaiement: (paiementData: Omit<Paiement, 'id'>) => Paiement;
  // Produits CRUD
  addProduit: (produitData: Omit<Produit, 'id' | 'createdAt'>) => Produit;
  updateProduit: (id: string, updates: Partial<Produit>) => void;
  deleteProduit: (id: string) => void;
  getProduit: (id: string) => Produit | undefined;
  // Company Settings
  updateCompanySettings: (updates: Partial<CompanySettings>) => void;
  // Reset
  resetToDefaultData: () => void;
}

// Initial Seed Data
const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    nom: 'Traoré',
    prenom: 'Amadou',
    entreprise: 'Traoré & Co',
    email: 'amadou.t@example.com',
    telephone: '+221 77 123 45 67',
    adresse: '123 Avenue Leopold Sedar Senghor, Plateau',
    ville: 'Dakar',
    codePostal: '11000',
    pays: 'Sénégal',
    ninea: '1234567890',
    statut: 'actif',
    commandesCount: 12,
    totalDepense: 18980,
    soldeDu: 1830,
    delaiPaiement: '14 Jours',
    createdAt: '2023-10-12',
  },
  {
    id: '2',
    nom: 'Ndiaye',
    prenom: 'Fatou',
    entreprise: 'Ndiaye Tech Solutions',
    email: 'fatou.n@ndiayetech.sn',
    telephone: '+221 76 987 65 43',
    adresse: 'Route des Almadies, Immeuble Horizon',
    ville: 'Dakar',
    codePostal: '12500',
    pays: 'Sénégal',
    ninea: '9876543210',
    statut: 'actif',
    commandesCount: 28,
    totalDepense: 35400,
    soldeDu: 0,
    delaiPaiement: '30 Jours',
    createdAt: '2023-11-04',
  },
  {
    id: '3',
    nom: 'Konaté',
    prenom: 'Ibrahim',
    entreprise: 'Konaté Logistics',
    email: 'contact@konate-log.com',
    telephone: '+225 07 45 67 89 01',
    adresse: 'Boulevard de la République',
    ville: 'Abidjan',
    codePostal: '01 BP 1234',
    pays: "Côte d'Ivoire",
    ninea: '5566778899',
    statut: 'actif',
    commandesCount: 3,
    totalDepense: 4800,
    soldeDu: 1200,
    delaiPaiement: '21 Jours',
    createdAt: '2024-01-15',
  },
  {
    id: '4',
    nom: 'Diallo',
    prenom: 'Aïssatou',
    entreprise: 'Indépendant',
    email: 'aissatou.d@freelance.org',
    telephone: '+221 78 345 67 89',
    adresse: 'Point E, Rue 3',
    ville: 'Dakar',
    codePostal: '10200',
    pays: 'Sénégal',
    ninea: '2233445566',
    statut: 'inactif',
    commandesCount: 1,
    totalDepense: 1500,
    soldeDu: 0,
    delaiPaiement: '7 Jours',
    createdAt: '2024-02-20',
  },
  {
    id: '5',
    nom: 'Dubois',
    prenom: 'Sophie',
    entreprise: 'Dubois Studio',
    email: 'sophie.dubois@design-studio.fr',
    telephone: '+33 6 12 34 56 78',
    adresse: '14 Rue de Rivoli',
    ville: 'Paris',
    codePostal: '75001',
    pays: 'France',
    ninea: '3344556677',
    statut: 'actif',
    commandesCount: 3,
    totalDepense: 450,
    soldeDu: 0,
    delaiPaiement: '30 Jours',
    createdAt: '2023-10-24',
  },
  {
    id: '6',
    nom: 'Lefèvre',
    prenom: 'Marc',
    entreprise: 'BTP Solutions',
    email: 'marc.lefevre@btp-services.com',
    telephone: '+33 6 23 45 67 89',
    adresse: '8 Boulevard de la Croix-Rousse',
    ville: 'Lyon',
    codePostal: '69004',
    pays: 'France',
    ninea: '4455667788',
    statut: 'actif',
    commandesCount: 1,
    totalDepense: 45.50,
    soldeDu: 45.50,
    delaiPaiement: '14 Jours',
    createdAt: '2023-10-25',
  },
  {
    id: '7',
    nom: 'Diallo',
    prenom: 'Amina',
    entreprise: 'Agro Sénégal',
    email: 'amina.diallo@agro-senegal.sn',
    telephone: '+221 77 654 32 10',
    adresse: 'Zone Industrielle de Dakar',
    ville: 'Dakar',
    codePostal: '11500',
    pays: 'Sénégal',
    ninea: '5566778899',
    statut: 'actif',
    commandesCount: 5,
    totalDepense: 1600,
    soldeDu: 320,
    delaiPaiement: '21 Jours',
    createdAt: '2023-10-25',
  },
  {
    id: '8',
    nom: 'Dupont',
    prenom: 'Jean',
    entreprise: 'Dupont Consulting',
    email: 'jean.dupont@dupont-consulting.fr',
    telephone: '+33 6 34 56 78 90',
    adresse: '22 La Canebière',
    ville: 'Marseille',
    codePostal: '13001',
    pays: 'France',
    ninea: '6677889900',
    statut: 'actif',
    commandesCount: 2,
    totalDepense: 180,
    soldeDu: 0,
    delaiPaiement: '30 Jours',
    createdAt: '2023-10-26',
  },
  {
    id: '9',
    nom: 'Fontaine',
    prenom: 'Claire',
    entreprise: 'Papeterie de l’Est',
    email: 'claire.fontaine@papeterie-est.fr',
    telephone: '+33 6 45 67 89 01',
    adresse: '5 Place Kléber',
    ville: 'Strasbourg',
    codePostal: '67000',
    pays: 'France',
    ninea: '7788990011',
    statut: 'inactif',
    commandesCount: 1,
    totalDepense: 12.50,
    soldeDu: 0,
    delaiPaiement: '7 Jours',
    createdAt: '2023-10-26',
  },
  {
    id: '10',
    nom: 'Martin',
    prenom: 'Thomas',
    entreprise: 'Tech Distribution',
    email: 'thomas.martin@tech-distrib.com',
    telephone: '+33 6 56 78 90 12',
    adresse: '12 Rue Crébillon',
    ville: 'Nantes',
    codePostal: '44000',
    pays: 'France',
    ninea: '8899001122',
    statut: 'actif',
    commandesCount: 8,
    totalDepense: 6800,
    soldeDu: 0,
    delaiPaiement: '30 Jours',
    createdAt: '2023-10-27',
  },
  {
    id: '11',
    nom: 'Bernard',
    prenom: 'Lucie',
    entreprise: 'Gourmet Paris',
    email: 'lucie.bernard@gourmet-paris.fr',
    telephone: '+33 6 67 89 01 23',
    adresse: '3 Cours de l’Intendance',
    ville: 'Bordeaux',
    codePostal: '33000',
    pays: 'France',
    ninea: '9900112233',
    statut: 'actif',
    commandesCount: 4,
    totalDepense: 840,
    soldeDu: 210.75,
    delaiPaiement: '14 Jours',
    createdAt: '2023-10-28',
  },
  {
    id: '12',
    nom: 'XYZ',
    prenom: 'Entreprise',
    entreprise: 'XYZ Industries',
    email: 'contact@xyz-industries.com',
    telephone: '+33 1 40 50 60 70',
    adresse: '50 Avenue des Champs-Élysées',
    ville: 'Paris',
    codePostal: '75008',
    pays: 'France',
    ninea: '1122334455',
    statut: 'actif',
    commandesCount: 12,
    totalDepense: 17400,
    soldeDu: 1450,
    delaiPaiement: '45 Jours',
    createdAt: '2023-10-28',
  },
];

const INITIAL_COMMANDES: Commande[] = [
  {
    id: '1',
    numero: 'CMD-2023-0891',
    clientId: '5',
    clientNom: 'Sophie Dubois',
    clientEmail: 'sophie.dubois@design-studio.fr',
    dateCreation: '24 Oct 2023',
    dateLivraison: '28/10/2023',
    creeePar: 'Moussa Diallo',
    statut: 'livree',
    articles: [
      { id: '1', productName: 'Support Premium', unitPrice: 120.00, quantity: 1 },
      { id: '2', productName: 'Huile Végétale 1L', unitPrice: 3.50, quantity: 5 },
      { id: '3', productName: 'Sucre en poudre 1kg', unitPrice: 1.25, quantity: 10 },
    ],
    totalHT: 125.00,
    tva: 25.00,
    totalTTC: 150.00,
    notes: 'Livraison effectuée avec accusé de réception.',
  },
  {
    id: '2',
    numero: 'CMD-2023-0892',
    clientId: '6',
    clientNom: 'Marc Lefèvre',
    clientEmail: 'marc.lefevre@btp-services.com',
    dateCreation: '25 Oct 2023',
    dateLivraison: '30/10/2023',
    creeePar: 'Moussa Diallo',
    statut: 'attente',
    articles: [
      { id: '1', productName: 'Farine de blé', unitPrice: 37.92, quantity: 1 },
    ],
    totalHT: 37.92,
    tva: 7.58,
    totalTTC: 45.50,
    notes: 'En attente de confirmation du bon de commande.',
  },
  {
    id: '3',
    numero: 'CMD-2023-0893',
    clientId: '7',
    clientNom: 'Amina Diallo',
    clientEmail: 'amina.diallo@agro-senegal.sn',
    dateCreation: '25 Oct 2023',
    dateLivraison: '29/10/2023',
    creeePar: 'Moussa Diallo',
    statut: 'preparation',
    articles: [
      { id: '1', productName: 'Farine de blé', unitPrice: 1.20, quantity: 100 },
      { id: '2', productName: 'Sucre en poudre 1kg', unitPrice: 1.10, quantity: 80 },
      { id: '3', productName: 'Huile Végétale 1L', unitPrice: 3.50, quantity: 15 },
      { id: '4', productName: 'Lait UHT 1L', unitPrice: 0.95, quantity: 5 },
      { id: '5', productName: 'Support Premium', unitPrice: 1.42, quantity: 1 },
    ],
    totalHT: 266.67,
    tva: 53.33,
    totalTTC: 320.00,
    notes: 'Préparation en entrepôt zone C.',
  },
  {
    id: '4',
    numero: 'CMD-2023-0894',
    clientId: '8',
    clientNom: 'Jean Dupont',
    clientEmail: 'jean.dupont@dupont-consulting.fr',
    dateCreation: '26 Oct 2023',
    dateLivraison: '02/11/2023',
    creeePar: 'Moussa Diallo',
    statut: 'confirmee',
    articles: [
      { id: '1', productName: 'Farine de blé', unitPrice: 1.20, quantity: 40 },
      { id: '2', productName: 'Huile Végétale 1L', unitPrice: 3.50, quantity: 7.69 },
    ],
    totalHT: 74.92,
    tva: 14.98,
    totalTTC: 89.90,
    notes: 'Bon de commande signé reçu, en cours de logistique.',
  },
  {
    id: '5',
    numero: 'CMD-2023-0895',
    clientId: '9',
    clientNom: 'Claire Fontaine',
    clientEmail: 'claire.fontaine@papeterie-est.fr',
    dateCreation: '26 Oct 2023',
    dateLivraison: '27/10/2023',
    creeePar: 'Moussa Diallo',
    statut: 'annulee',
    articles: [
      { id: '1', productName: 'Sucre en poudre 1kg', unitPrice: 10.42, quantity: 1 },
    ],
    totalHT: 10.42,
    tva: 2.08,
    totalTTC: 12.50,
    notes: 'Annulation demandée par le client par email.',
  },
  {
    id: '6',
    numero: 'CMD-2023-0896',
    clientId: '10',
    clientNom: 'Thomas Martin',
    clientEmail: 'thomas.martin@tech-distrib.com',
    dateCreation: '27 Oct 2023',
    dateLivraison: '31/10/2023',
    creeePar: 'Moussa Diallo',
    statut: 'livree',
    articles: [
      { id: '1', productName: 'Licence Pro Annuelle', unitPrice: 450.00, quantity: 1 },
      { id: '2', productName: 'Formation Initiale', unitPrice: 250.00, quantity: 1 },
      { id: '3', productName: 'Lait UHT 1L', unitPrice: 1.04, quantity: 8 },
    ],
    totalHT: 708.33,
    tva: 141.67,
    totalTTC: 850.00,
    notes: 'Livraison express effectuée par Chronopost.',
  },
  {
    id: '7',
    numero: 'CMD-2023-0897',
    clientId: '11',
    clientNom: 'Lucie Bernard',
    clientEmail: 'lucie.bernard@gourmet-paris.fr',
    dateCreation: '28 Oct 2023',
    dateLivraison: '05/11/2023',
    creeePar: 'Moussa Diallo',
    statut: 'attente',
    articles: [
      { id: '1', productName: 'Farine de blé', unitPrice: 1.20, quantity: 50 },
      { id: '2', productName: 'Sucre en poudre 1kg', unitPrice: 1.10, quantity: 45 },
      { id: '3', productName: 'Huile Végétale 1L', unitPrice: 3.50, quantity: 15 },
      { id: '4', productName: 'Lait UHT 1L', unitPrice: 0.95, quantity: 14.35 },
    ],
    totalHT: 175.63,
    tva: 35.12,
    totalTTC: 210.75,
    notes: 'Attente de confirmation du créneau de livraison.',
  },
  {
    id: '8',
    numero: 'CMD-2023-0898',
    clientId: '12',
    clientNom: 'Entreprise XYZ',
    clientEmail: 'contact@xyz-industries.com',
    dateCreation: '28 Oct 2023',
    dateLivraison: '04/11/2023',
    creeePar: 'Moussa Diallo',
    statut: 'confirmee',
    articles: [
      { id: '1', productName: 'Licence Pro Annuelle', unitPrice: 450.00, quantity: 2 },
      { id: '2', productName: 'Migration de données', unitPrice: 300.00, quantity: 1 },
      { id: '3', productName: 'Support Premium', unitPrice: 1.03, quantity: 8 },
    ],
    totalHT: 1208.33,
    tva: 241.67,
    totalTTC: 1450.00,
    notes: 'Grand compte - Facture à envoyer au service comptabilité sous 48h.',
  },
  {
    id: 'cmd-47',
    numero: 'CMD-2026-0047',
    clientId: '1',
    clientNom: 'Amadou Traoré (Traoré & Co)',
    clientEmail: 'amadou.t@example.com',
    dateCreation: '25/08/2026',
    dateLivraison: '28/08/2026',
    creeePar: 'Moussa Diallo',
    statut: 'livree',
    articles: [
      { id: '1', productName: 'Sucre en poudre 1kg', unitPrice: 1.10, quantity: 9 },
      { id: '2', productName: 'Huile Végétale 1L', unitPrice: 3.50, quantity: 1 },
      { id: '3', productName: 'Licence Pro Annuelle', unitPrice: 450.00, quantity: 1 },
    ],
    totalHT: 463.40,
    tva: 83.41,
    totalTTC: 546.81,
    notes: 'Livraison express effectuée par le transporteur Dakar Express.',
  },
  {
    id: 'cmd-46',
    numero: 'CMD-2026-0046',
    clientId: '2',
    clientNom: 'Fatou Ndiaye (Ndiaye Tech Solutions)',
    clientEmail: 'fatou.n@ndiayetech.sn',
    dateCreation: '24/08/2026',
    dateLivraison: '30/08/2026',
    creeePar: 'Moussa Diallo',
    statut: 'attente',
    articles: [
      { id: '1', productName: 'Formation Initiale', unitPrice: 250.00, quantity: 2 },
      { id: '2', productName: 'Support Premium', unitPrice: 120.00, quantity: 1 },
    ],
    totalHT: 620.00,
    tva: 111.60,
    totalTTC: 731.60,
    notes: 'En attente de confirmation du bon de commande par la direction.',
  },
  {
    id: 'cmd-45',
    numero: 'CMD-2026-0045',
    clientId: '3',
    clientNom: 'Ibrahim Konaté (Konaté Logistics)',
    clientEmail: 'contact@konate-log.com',
    dateCreation: '22/08/2026',
    dateLivraison: '25/08/2026',
    creeePar: 'API Logistique',
    statut: 'preparation',
    articles: [
      { id: '1', productName: 'Farine de blé', unitPrice: 1.20, quantity: 200 },
    ],
    totalHT: 240.00,
    tva: 43.20,
    totalTTC: 283.20,
    notes: 'Préparation en entrepôt zone B.',
  },
];

const INITIAL_FACTURES: Facture[] = [
  {
    id: 'fac-2026-0038',
    numero: 'FAC-2026-0038',
    commandeId: 'cmd-47',
    commandeNumero: '0047',
    clientId: '1',
    clientNom: 'Amadou Trading',
    clientEmail: 'amadou.trading@example.com',
    dateEmission: '24/10/2026',
    dateEcheance: '24/11/2026',
    statut: 'attente',
    articles: [
      { id: '1', description: 'Farine de Blé', quantity: 10, unitPrice: 35.00 },
      { id: '2', description: "Huile d'Arachide", quantity: 15, unitPrice: 42.00 },
    ],
    totalHT: 20416.67,
    tva: 4083.33,
    totalTTC: 24500.00,
    montantPaye: 500.00,
    resteDu: 24000.00,
    notes: 'Paiement à 30 jours fin de mois.',
  },
  {
    id: 'fac-2026-0039',
    numero: 'FAC-2026-0039',
    commandeId: 'cmd-46',
    commandeNumero: '0049',
    clientId: '2',
    clientNom: 'Sogea SARL',
    clientEmail: 'contact@sogea.sn',
    dateEmission: '26/08/2026',
    dateEcheance: '25/09/2026',
    statut: 'attente',
    articles: [
      { id: '1', description: 'Licences utilisateurs annuelles', quantity: 5, unitPrice: 450.00 },
      { id: '2', description: 'Formation des équipes sur site', quantity: 1, unitPrice: 990.00 },
    ],
    totalHT: 2700.00,
    tva: 540.00,
    totalTTC: 3240.00,
    montantPaye: 0.00,
    resteDu: 3240.00,
    notes: 'Facture en attente de validation.',
  },
  {
    id: 'fac-2026-0040',
    numero: 'FAC-2026-0040',
    commandeId: 'cmd-45',
    commandeNumero: '0050',
    clientId: '3',
    clientNom: 'Diallo & Frères',
    clientEmail: 'contact@diallo.sn',
    dateEmission: '01/08/2026',
    dateEcheance: '01/09/2026',
    statut: 'retard',
    articles: [
      { id: '1', description: 'Prestation Logistique & Transit', quantity: 1, unitPrice: 7458.75 },
    ],
    totalHT: 7458.75,
    tva: 1491.75,
    totalTTC: 8950.50,
    montantPaye: 0.00,
    resteDu: 8950.50,
    notes: 'Relance effectuée le 20/08/2026.',
  },
  {
    id: 'fac-2026-0043',
    numero: 'FAC-2026-0043',
    commandeId: 'cmd-44',
    commandeNumero: '0055',
    clientId: '4',
    clientNom: 'Sénégal Fournitures',
    clientEmail: 'contact@senegal-fournitures.sn',
    dateEmission: '30/08/2026',
    dateEcheance: '30/09/2026',
    statut: 'payee',
    articles: [
      { id: '1', description: 'Fournitures de bureau & consommables', quantity: 10, unitPrice: 175.00 },
    ],
    totalHT: 1750.00,
    tva: 350.00,
    totalTTC: 2100.00,
    montantPaye: 2100.00,
    resteDu: 0.00,
    notes: 'Facture acquittée.',
  },
];

const INITIAL_PAIEMENTS: Paiement[] = [
  {
    id: '1',
    reference: 'PAY-2026-081',
    factureId: 'fac-2026-0038',
    factureNumero: 'FAC-2026-0038',
    clientId: '1',
    clientNom: 'Amadou Traoré (Traoré & Co)',
    montant: 500.00,
    methode: 'virement',
    date: '28/08/2026',
    statut: 'reussi',
    notes: 'Acompte initial 500 € reçu par virement SEPA.',
  },
  {
    id: '2',
    reference: 'PAY-2026-079',
    factureId: 'fac-2026-0039',
    factureNumero: 'FAC-2026-0039',
    clientId: '2',
    clientNom: 'Fatou Ndiaye (Ndiaye Tech Solutions)',
    montant: 3823.20,
    methode: 'virement',
    date: '27/08/2026',
    statut: 'reussi',
    notes: 'Solde complet de la facture.',
  },
  {
    id: '3',
    reference: 'PAY-2026-075',
    factureId: 'fac-2026-0038',
    factureNumero: 'FAC-2026-0038',
    clientId: '1',
    clientNom: 'Amadou Traoré (Traoré & Co)',
    montant: 676.00,
    methode: 'carte',
    date: '30/08/2026',
    statut: 'attente',
    notes: 'Autorisation carte en cours de validation.',
  },
];

export const INITIAL_PRODUITS: Produit[] = [
  {
    id: 'prod-1',
    nom: 'Farine de blé',
    sku: 'FAR-001',
    categorie: 'alimentaire',
    prix: 1.20,
    tva: 18,
    stock: 150,
    alerte: 20,
    icon: 'bakery_dining',
    description: 'Farine de blé raffinée de première qualité pour boulangerie et pâtisserie.',
    createdAt: '2024-01-15',
  },
  {
    id: 'prod-2',
    nom: 'Huile Végétale 1L',
    sku: 'HUI-002',
    categorie: 'alimentaire',
    prix: 3.50,
    tva: 18,
    stock: 12,
    alerte: 15,
    icon: 'oil_barrel',
    description: 'Huile végétale 100% pure et enrichie en vitamine A.',
    createdAt: '2024-01-16',
  },
  {
    id: 'prod-3',
    nom: 'Sucre en poudre 1kg',
    sku: 'SUC-003',
    categorie: 'alimentaire',
    prix: 1.10,
    tva: 18,
    stock: 85,
    alerte: 20,
    icon: 'grain',
    description: 'Sucre blanc cristallisé en sachet de 1kg.',
    createdAt: '2024-01-18',
  },
  {
    id: 'prod-4',
    nom: 'Lait UHT 1L',
    sku: 'LAI-004',
    categorie: 'alimentaire',
    prix: 0.95,
    tva: 18,
    stock: 0,
    alerte: 10,
    icon: 'water_drop',
    description: 'Lait demi-écrémé stérilisé UHT longue conservation.',
    createdAt: '2024-01-20',
  },
  {
    id: 'prod-5',
    nom: 'Savon liquide vaisselle 5L',
    sku: 'ENT-005',
    categorie: 'entretien',
    prix: 4.80,
    tva: 18,
    stock: 45,
    alerte: 10,
    icon: 'cleaning_services',
    description: 'Savon liquide dégraissant haute performance pour vaisselle professionnelle.',
    createdAt: '2024-02-01',
  },
  {
    id: 'prod-6',
    nom: 'Nettoyant multi-surfaces 1L',
    sku: 'ENT-006',
    categorie: 'entretien',
    prix: 2.30,
    tva: 18,
    stock: 30,
    alerte: 10,
    icon: 'sanitizer',
    description: 'Nettoyant désinfectant multi-surfaces pour locaux professionnels.',
    createdAt: '2024-02-03',
  },
  {
    id: 'prod-7',
    nom: "Jus d'Orange Pur Jus 1L",
    sku: 'BOI-007',
    categorie: 'boissons',
    prix: 1.80,
    tva: 18,
    stock: 60,
    alerte: 15,
    icon: 'local_bar',
    description: "Jus d'orange pressé 100% pur jus sans sucres ajoutés.",
    createdAt: '2024-02-05',
  },
];

export const CURRENCY_CONFIG: Record<string, { rate: number; symbol: string; decimals: number; position: 'after' | 'before' }> = {
  EUR: { rate: 1, symbol: '€', decimals: 2, position: 'after' },
  XOF: { rate: 655.957, symbol: 'FCFA', decimals: 0, position: 'after' },
  USD: { rate: 1.08, symbol: '$', decimals: 2, position: 'before' },
};

export { TRANSLATIONS } from '@/i18n/translations';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'GestPro S.A.S',
  siret: '123 456 789 00012',
  tva: 'FR 12 345678901',
  address: '15 Avenue des Champs-Élysées',
  zip: '75008',
  city: 'Paris',
  phone: '+33 1 42 68 55 00',
  email: 'contact@gestpro.fr',
  website: 'https://gestpro.fr',
  currency: 'EUR',
  language: 'fr',
  dateFormat: 'JJ/MM/AAAA',
  timezone: 'Africa/Dakar (GMT+0)',
  defaultTva: 20,
  paymentTermsDays: 30,
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: "Facture en retard d'échéance",
    message: "La facture FAC-2026-0038 de Amadou Trading (24 000 FCFA) nécessite une relance.",
    time: "Il y a 15 min",
    timestamp: Date.now() - 15 * 60 * 1000,
    type: 'invoice',
    icon: 'warning',
    iconBg: 'bg-error/15',
    iconColor: 'text-error',
    read: false,
    link: '/dashboard/factures/fac-2026-0038',
  },
  {
    id: 'notif-2',
    title: 'Nouvelle commande à préparer',
    message: 'La commande CMD-2026-0046 (Fatou Ndiaye) a été validée et attend sa préparation.',
    time: 'Il y a 1h',
    timestamp: Date.now() - 60 * 60 * 1000,
    type: 'order',
    icon: 'shopping_bag',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    read: false,
    link: '/dashboard/commandes/cmd-46',
  },
  {
    id: 'notif-3',
    title: 'Paiement reçu avec succès',
    message: 'Virement de 500 000 FCFA enregistré pour la facture FAC-2026-0035.',
    time: 'Il y a 3h',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    type: 'payment',
    icon: 'payments',
    iconBg: 'bg-success/15',
    iconColor: 'text-success',
    read: false,
    link: '/dashboard/paiements',
  },
  {
    id: 'notif-4',
    title: 'Alerte stock critique',
    message: "Le produit Farine de blé a atteint son seuil d'alerte (stock restant: 12 unités).",
    time: 'Hier',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    type: 'alert',
    icon: 'inventory_2',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    read: true,
    link: '/dashboard/produits',
  },
  {
    id: 'notif-5',
    title: 'Nouveau client enregistré',
    message: 'Le client "Sénégal Tech Solutions" a été ajouté avec succès.',
    time: 'Il y a 2 jours',
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    type: 'client',
    icon: 'person_add',
    iconBg: 'bg-tertiary-container/15',
    iconColor: 'text-tertiary-container',
    read: true,
    link: '/dashboard/clients',
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CLIENTS = 'gestpro_clients_v1';
const LOCAL_STORAGE_KEY_COMMANDES = 'gestpro_commandes_v1';
const LOCAL_STORAGE_KEY_FACTURES = 'gestpro_factures_v5';
const LOCAL_STORAGE_KEY_PAIEMENTS = 'gestpro_paiements_v1';
const LOCAL_STORAGE_KEY_PRODUITS = 'gestpro_produits_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'gestpro_company_settings_v1';
const LOCAL_STORAGE_KEY_THEME = 'gestpro_theme';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'gestpro_notifications_v1';

function applyThemeToDOM(mode: ThemeMode) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [commandes, setCommandes] = useState<Commande[]>(INITIAL_COMMANDES);
  const [factures, setFactures] = useState<Facture[]>(INITIAL_FACTURES);
  const [paiements, setPaiements] = useState<Paiement[]>(INITIAL_PAIEMENTS);
  const [produits, setProduits] = useState<Produit[]>(INITIAL_PRODUITS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, nextTheme);
      } catch (e) {
        console.warn('Could not save theme to localStorage', e);
      }
      applyThemeToDOM(nextTheme);
      return nextTheme;
    });
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
    } catch (e) {
      console.warn('Could not save theme to localStorage', e);
    }
    applyThemeToDOM(newTheme);
  };

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeState(storedTheme);
        applyThemeToDOM(storedTheme);
      } else {
        applyThemeToDOM('dark');
      }

      const storedClients = localStorage.getItem(LOCAL_STORAGE_KEY_CLIENTS);
      if (storedClients) {
        try {
          const parsedClients: Client[] = JSON.parse(storedClients);
          const missingClients = INITIAL_CLIENTS.filter(
            (init) => !parsedClients.some((p) => p.id === init.id)
          );
          const fullClients = [...parsedClients, ...missingClients];
          setClients(fullClients);
          localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(fullClients));
        } catch {
          setClients(INITIAL_CLIENTS);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      }

      const storedCmds = localStorage.getItem(LOCAL_STORAGE_KEY_COMMANDES);
      if (storedCmds) {
        try {
          const parsedCmds: Commande[] = JSON.parse(storedCmds);
          const needsMigration = !parsedCmds.some((p) => p.id === '4' || p.numero === 'CMD-2023-0894');
          if (needsMigration) {
            const userCreated = parsedCmds.filter(
              (p) => !INITIAL_COMMANDES.some((init) => init.id === p.id || init.numero === p.numero) && p.id.length > 5
            );
            const mergedCmds = [...INITIAL_COMMANDES, ...userCreated];
            setCommandes(mergedCmds);
            localStorage.setItem(LOCAL_STORAGE_KEY_COMMANDES, JSON.stringify(mergedCmds));
          } else {
            setCommandes(parsedCmds);
          }
        } catch {
          setCommandes(INITIAL_COMMANDES);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_COMMANDES, JSON.stringify(INITIAL_COMMANDES));
      }

      const storedFacs = localStorage.getItem(LOCAL_STORAGE_KEY_FACTURES);
      if (storedFacs) {
        try {
          const parsedFacs: Facture[] = JSON.parse(storedFacs);
          const userCreated = parsedFacs.filter(
            (p) => !INITIAL_FACTURES.some((init) => init.id === p.id || init.numero === p.numero) && p.id.length > 8
          );
          const merged = [...INITIAL_FACTURES, ...userCreated];
          setFactures(merged);
        } catch {
          setFactures(INITIAL_FACTURES);
        }
      } else {
        setFactures(INITIAL_FACTURES);
        localStorage.setItem(LOCAL_STORAGE_KEY_FACTURES, JSON.stringify(INITIAL_FACTURES));
      }

      const storedPays = localStorage.getItem(LOCAL_STORAGE_KEY_PAIEMENTS);
      if (storedPays) {
        try {
          setPaiements(JSON.parse(storedPays));
        } catch {
          setPaiements(INITIAL_PAIEMENTS);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_PAIEMENTS, JSON.stringify(INITIAL_PAIEMENTS));
      }

      const storedProds = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUITS);
      if (storedProds) {
        try {
          const parsedProds: Produit[] = JSON.parse(storedProds);
          const missingProds = INITIAL_PRODUITS.filter(
            (init) => !parsedProds.some((p) => p.id === init.id || p.sku === init.sku)
          );
          const fullProds = [...parsedProds, ...missingProds];
          setProduits(fullProds);
          localStorage.setItem(LOCAL_STORAGE_KEY_PRODUITS, JSON.stringify(fullProds));
        } catch {
          setProduits(INITIAL_PRODUITS);
        }
      } else {
        setProduits(INITIAL_PRODUITS);
        localStorage.setItem(LOCAL_STORAGE_KEY_PRODUITS, JSON.stringify(INITIAL_PRODUITS));
      }

      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        try {
          setCompanySettings({ ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(storedSettings) });
        } catch {
          setCompanySettings(DEFAULT_COMPANY_SETTINGS);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
      }

      const storedNotifs = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
      if (storedNotifs) {
        try {
          setNotifications(JSON.parse(storedNotifs));
        } catch {
          setNotifications(INITIAL_NOTIFICATIONS);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save clients to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(clients));
      } catch (e) {
        console.warn('Could not save clients to localStorage', e);
      }
    }
  }, [clients, isHydrated]);

  // Save commandes to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_COMMANDES, JSON.stringify(commandes));
      } catch (e) {
        console.warn('Could not save commandes to localStorage', e);
      }
    }
  }, [commandes, isHydrated]);

  // Save factures to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_FACTURES, JSON.stringify(factures));
      } catch (e) {
        console.warn('Could not save factures to localStorage', e);
      }
    }
  }, [factures, isHydrated]);

  // Save paiements to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PAIEMENTS, JSON.stringify(paiements));
      } catch (e) {
        console.warn('Could not save paiements to localStorage', e);
      }
    }
  }, [paiements, isHydrated]);

  // Save produits to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PRODUITS, JSON.stringify(produits));
      } catch (e) {
        console.warn('Could not save produits to localStorage', e);
      }
    }
  }, [produits, isHydrated]);

  // Save notifications to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
      } catch (e) {
        console.warn('Could not save notifications to localStorage', e);
      }
    }
  }, [notifications, isHydrated]);

  // Notifications Helpers
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Toutes les notifications sont marquées comme lues', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Toutes les notifications ont été effacées', 'info');
  };

  const addNotification = (
    notifData: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ) => {
    const newItem: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = String(Date.now());
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Client CRUD
  const addClient = (
    newClientData: Omit<Client, 'id' | 'createdAt' | 'commandesCount' | 'totalDepense' | 'soldeDu' | 'delaiPaiement'>
  ): Client => {
    const nextId = String(Date.now());
    const dateStr = new Date().toISOString().slice(0, 10);
    const createdClient: Client = {
      ...newClientData,
      id: nextId,
      commandesCount: 0,
      totalDepense: 0,
      soldeDu: 0,
      delaiPaiement: '30 Jours',
      createdAt: dateStr,
    };

    setClients((prev) => [createdClient, ...prev]);
    showToast(`Client "${createdClient.prenom} ${createdClient.nom}" créé avec succès !`, 'success');
    return createdClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coordonnées du client mises à jour !', 'success');
  };

  const deleteClient = (id: string) => {
    const target = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast(`Client ${target ? `"${target.prenom} ${target.nom}"` : ''} supprimé.`, 'info');
  };

  const getClient = (id: string): Client | undefined => {
    return clients.find((c) => c.id === id);
  };

  const getClientOrders = (clientId: string): Commande[] => {
    return commandes.filter((c) => c.clientId === clientId);
  };

  const getClientInvoices = (clientId: string): Facture[] => {
    return factures.filter((f) => f.clientId === clientId);
  };

  const getClientPayments = (clientId: string): Paiement[] => {
    return paiements.filter((p) => p.clientId === clientId);
  };

  // Commandes CRUD
  const addCommande = (
    commandeData: Omit<Commande, 'id' | 'numero' | 'dateCreation'>
  ): Commande => {
    const nextId = String(Date.now());
    const randomNum = 48 + commandes.length;
    const padNum = String(randomNum).padStart(4, '0');
    const numero = `CMD-2026-${padNum}`;
    const today = new Date();
    const dateCreation = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newCmd: Commande = {
      ...commandeData,
      id: nextId,
      numero,
      dateCreation,
    };

    setCommandes((prev) => [newCmd, ...prev]);

    // Synchronize client stats
    if (commandeData.clientId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === commandeData.clientId) {
            return {
              ...c,
              commandesCount: c.commandesCount + 1,
              totalDepense: c.totalDepense + newCmd.totalTTC,
            };
          }
          return c;
        })
      );
    }

    showToast(`Commande ${numero} créée avec succès !`, 'success');
    return newCmd;
  };

  const updateCommande = (id: string, updates: Partial<Commande>) => {
    setCommandes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Commande mise à jour avec succès.', 'success');
  };

  const updateCommandeStatus = (id: string, newStatus: Commande['statut']) => {
    const labels: Record<Commande['statut'], string> = {
      attente: 'En attente',
      confirmee: 'Confirmée',
      preparation: 'En préparation',
      livree: 'Livrée',
      annulee: 'Annulée',
    };

    setCommandes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statut: newStatus } : c))
    );
    showToast(`Statut mis à jour : ${labels[newStatus]}`, 'success');
  };

  const deleteCommande = (id: string) => {
    const target = commandes.find((c) => c.id === id);
    setCommandes((prev) => prev.filter((c) => c.id !== id));
    showToast(`Commande ${target ? target.numero : ''} supprimée.`, 'info');
  };

  const getCommande = (id: string): Commande | undefined => {
    if (!id) return undefined;
    const trimmed = id.trim();
    const lower = trimmed.toLowerCase();
    const cleanNum = trimmed.replace(/^cmd-?/i, '').replace(/^\d{4}-/, '').toLowerCase();
    return (
      commandes.find(
        (c) =>
          c.id === trimmed ||
          c.numero === trimmed ||
          c.numero.toLowerCase() === lower ||
          c.numero.toLowerCase().endsWith(lower) ||
          c.numero.replace(/^CMD-?/i, '').replace(/^\d{4}-/, '').toLowerCase() === cleanNum
      ) ||
      INITIAL_COMMANDES.find(
        (c) =>
          c.id === trimmed ||
          c.numero === trimmed ||
          c.numero.toLowerCase() === lower ||
          c.numero.toLowerCase().endsWith(lower) ||
          c.numero.replace(/^CMD-?/i, '').replace(/^\d{4}-/, '').toLowerCase() === cleanNum
      )
    );
  };

  // Factures CRUD
  const addFacture = (
    factureData: Omit<Facture, 'id' | 'numero' | 'dateEmission'>
  ): Facture => {
    const nextId = 'fac-' + Date.now();
    const randomNum = 140 + factures.length;
    const numero = `FAC-2026-${String(randomNum).padStart(4, '0')}`;
    const today = new Date();
    const dateEmission = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newFacture: Facture = {
      ...factureData,
      id: nextId,
      numero,
      dateEmission,
      montantPaye: factureData.montantPaye || (factureData.statut === 'payee' ? factureData.totalTTC : 0),
      resteDu: factureData.statut === 'payee' ? 0 : Math.max(0, factureData.totalTTC - (factureData.montantPaye || 0)),
    };

    setFactures((prev) => [newFacture, ...prev]);

    if (newFacture.resteDu > 0 && newFacture.clientId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === newFacture.clientId
            ? { ...c, soldeDu: (c.soldeDu || 0) + newFacture.resteDu }
            : c
        )
      );
    }

    showToast(`Facture ${numero} créée avec succès !`, 'success');
    return newFacture;
  };

  const updateFacture = (id: string, updates: Partial<Facture>) => {
    setFactures((prev) =>
      prev.map((f) => (f.id === id || f.numero === id ? { ...f, ...updates } : f))
    );
    showToast('Facture mise à jour avec succès.', 'success');
  };

  const updateFactureStatus = (id: string, newStatus: Facture['statut']) => {
    setFactures((prev) =>
      prev.map((f) => {
        if (f.id === id || f.numero === id) {
          const isPaid = newStatus === 'payee';
          return {
            ...f,
            statut: newStatus,
            montantPaye: isPaid ? f.totalTTC : f.montantPaye,
            resteDu: isPaid ? 0 : f.resteDu,
          };
        }
        return f;
      })
    );
    showToast('Statut de la facture mis à jour.', 'success');
  };

  const markFactureAsPaid = (id: string) => {
    const target = factures.find((f) => f.id === id || f.numero === id) || INITIAL_FACTURES.find((f) => f.id === id || f.numero === id);
    if (!target) return;

    const amountPaid = target.resteDu > 0 ? target.resteDu : target.totalTTC;

    setFactures((prev) => {
      const exists = prev.some((f) => f.id === target.id || f.numero === target.numero);
      if (!exists) {
        return [
          {
            ...target,
            statut: 'payee',
            montantPaye: target.totalTTC,
            resteDu: 0,
          },
          ...prev,
        ];
      }
      return prev.map((f) =>
        f.id === target.id || f.numero === target.numero
          ? {
              ...f,
              statut: 'payee',
              montantPaye: target.totalTTC,
              resteDu: 0,
            }
          : f
      );
    });

    const newPayment: Paiement = {
      id: String(Date.now()),
      reference: `PAY-${target.numero.replace('FAC-', '')}`,
      factureId: target.id,
      factureNumero: target.numero,
      clientId: target.clientId,
      clientNom: target.clientNom,
      montant: amountPaid,
      methode: 'virement',
      date: new Date().toLocaleDateString('fr-FR'),
      statut: 'reussi',
      notes: 'Règlement total enregistré via le bouton "Marquer payée".',
    };
    setPaiements((prev) => [newPayment, ...prev]);

    if (target.clientId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === target.clientId
            ? { ...c, soldeDu: Math.max(0, (c.soldeDu || 0) - amountPaid) }
            : c
        )
      );
    }

    showToast(`Facture ${target.numero} marquée comme payée (Paiement ${newPayment.reference} enregistré).`, 'success');
  };

  const deleteFacture = (id: string) => {
    const target = factures.find((f) => f.id === id || f.numero === id);
    setFactures((prev) => prev.filter((f) => f.id !== id && f.numero !== id));
    showToast(`Facture ${target ? target.numero : ''} supprimée.`, 'info');
  };

  const getFacture = (id: string): Facture | undefined => {
    if (!id) return undefined;
    const trimmed = id.trim();
    const lower = trimmed.toLowerCase();
    return (
      factures.find(
        (f) => f.id === trimmed || f.numero === trimmed || f.numero.toLowerCase() === lower
      ) ||
      INITIAL_FACTURES.find(
        (f) => f.id === trimmed || f.numero === trimmed || f.numero.toLowerCase() === lower
      )
    );
  };

  const addPaiement = (paiementData: Omit<Paiement, 'id'>): Paiement => {
    const newPayment: Paiement = {
      ...paiementData,
      id: 'pay-' + Date.now(),
    };
    setPaiements((prev) => [newPayment, ...prev]);

    // If linked to a facture, update the facture's montantPaye, resteDu and status
    if (newPayment.factureId || newPayment.factureNumero) {
      setFactures((prev) =>
        prev.map((f) => {
          if (f.id === newPayment.factureId || f.numero === newPayment.factureNumero || f.id === newPayment.factureNumero) {
            const newMontantPaye = Number(((f.montantPaye || 0) + newPayment.montant).toFixed(2));
            const newResteDu = Math.max(0, Number((f.totalTTC - newMontantPaye).toFixed(2)));
            const isFull = newResteDu <= 0;
            return {
              ...f,
              montantPaye: newMontantPaye,
              resteDu: newResteDu,
              statut: isFull ? 'payee' : f.statut,
            };
          }
          return f;
        })
      );
    }

    if (newPayment.clientId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === newPayment.clientId
            ? { ...c, soldeDu: Math.max(0, Number(((c.soldeDu || 0) - newPayment.montant).toFixed(2))) }
            : c
        )
      );
    }

    showToast(`Paiement de ${formatCurrency(newPayment.montant)} enregistré avec succès.`, 'success');
    return newPayment;
  };

  // Produits CRUD
  const addProduit = (
    produitData: Omit<Produit, 'id' | 'createdAt'>
  ): Produit => {
    const nextId = 'prod-' + Date.now();
    const dateStr = new Date().toISOString().slice(0, 10);
    let icon = produitData.icon;
    if (!icon) {
      const cat = (produitData.categorie || '').toLowerCase();
      if (cat.includes('alim')) icon = 'bakery_dining';
      else if (cat.includes('entret')) icon = 'cleaning_services';
      else if (cat.includes('bois')) icon = 'local_bar';
      else icon = 'inventory_2';
    }

    const newProduit: Produit = {
      ...produitData,
      id: nextId,
      icon,
      createdAt: dateStr,
    };

    setProduits((prev) => [newProduit, ...prev]);
    showToast(`Produit "${newProduit.nom}" créé avec succès !`, 'success');
    return newProduit;
  };

  const updateProduit = (id: string, updates: Partial<Produit>) => {
    setProduits((prev) =>
      prev.map((p) => (p.id === id || p.sku === id ? { ...p, ...updates } : p))
    );
    showToast('Produit mis à jour avec succès.', 'success');
  };

  const deleteProduit = (id: string) => {
    const target = produits.find((p) => p.id === id || p.sku === id);
    setProduits((prev) => prev.filter((p) => p.id !== id && p.sku !== id));
    showToast(`Produit ${target ? `"${target.nom}"` : ''} supprimé.`, 'info');
  };

  const getProduit = (id: string): Produit | undefined => {
    if (!id) return undefined;
    const trimmed = id.trim();
    const lower = trimmed.toLowerCase();
    return (
      produits.find((p) => p.id === trimmed || p.sku.toLowerCase() === lower) ||
      INITIAL_PRODUITS.find((p) => p.id === trimmed || p.sku.toLowerCase() === lower)
    );
  };

  const updateCompanySettings = (updates: Partial<CompanySettings>) => {
    setCompanySettings((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save company settings to localStorage', e);
      }
      return updated;
    });
    showToast('Informations de l’entreprise enregistrées avec succès !', 'success');
  };

  const resetToDefaultData = () => {
    setClients(INITIAL_CLIENTS);
    setCommandes(INITIAL_COMMANDES);
    setFactures(INITIAL_FACTURES);
    setPaiements(INITIAL_PAIEMENTS);
    setProduits(INITIAL_PRODUITS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCompanySettings(DEFAULT_COMPANY_SETTINGS);
    localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(LOCAL_STORAGE_KEY_COMMANDES, JSON.stringify(INITIAL_COMMANDES));
    localStorage.setItem(LOCAL_STORAGE_KEY_FACTURES, JSON.stringify(INITIAL_FACTURES));
    localStorage.setItem(LOCAL_STORAGE_KEY_PAIEMENTS, JSON.stringify(INITIAL_PAIEMENTS));
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODUITS, JSON.stringify(INITIAL_PRODUITS));
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
    showToast('Données réinitialisées avec succès.', 'info');
  };

  const activeCurrency = companySettings.currency || 'EUR';
  const currencyConfig = CURRENCY_CONFIG[activeCurrency] || CURRENCY_CONFIG.EUR;
  const currencyCode = activeCurrency;
  const currencySymbol = currencyConfig.symbol;

  const convertPrice = (amountInEUR: number): number => {
    if (typeof amountInEUR !== 'number' || isNaN(amountInEUR)) return 0;
    return amountInEUR * currencyConfig.rate;
  };

  const toBasePrice = (amountInSelectedCurrency: number): number => {
    if (typeof amountInSelectedCurrency !== 'number' || isNaN(amountInSelectedCurrency)) return 0;
    return amountInSelectedCurrency / currencyConfig.rate;
  };

  const formatCurrency = (
    amountInEUR: number,
    options?: { showDecimals?: boolean; compact?: boolean; forceDecimals?: number }
  ): string => {
    if (typeof amountInEUR !== 'number' || isNaN(amountInEUR)) return `0 ${currencySymbol}`;
    const converted = amountInEUR * currencyConfig.rate;

    if (options?.compact) {
      if (converted >= 1_000_000) {
        return `${(converted / 1_000_000).toFixed(1)}M ${currencySymbol}`;
      }
      if (converted >= 1_000) {
        return `${(converted / 1_000).toFixed(1)}k ${currencySymbol}`;
      }
    }

    const decimals = options?.forceDecimals !== undefined
      ? options.forceDecimals
      : options?.showDecimals === false
      ? 0
      : currencyConfig.decimals;

    const parts = converted.toFixed(decimals).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formattedNum = parts.length > 1 && decimals > 0 ? `${integerPart},${parts[1]}` : integerPart;

    if (currencyConfig.position === 'before') {
      return `${currencyConfig.symbol} ${formattedNum}`;
    }
    return `${formattedNum} ${currencyConfig.symbol}`;
  };

  const activeLang = (companySettings.language === 'en' ? 'en' : 'fr') as Language;
  const t = (key: string): string => {
    return getTranslation(key, activeLang);
  };

  return (
    <StoreContext.Provider
      value={{
        isHydrated,
        theme,
        toggleTheme,
        setTheme,
        currencyCode,
        currencySymbol,
        formatCurrency,
        convertPrice,
        toBasePrice,
        t,
        clients,
        commandes,
        factures,
        paiements,
        produits,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
        companySettings,
        toast,
        showToast,
        hideToast,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        getClientOrders,
        getClientInvoices,
        getClientPayments,
        addCommande,
        updateCommande,
        updateCommandeStatus,
        deleteCommande,
        getCommande,
        addFacture,
        updateFacture,
        updateFactureStatus,
        markFactureAsPaid,
        deleteFacture,
        getFacture,
        addPaiement,
        addProduit,
        updateProduit,
        deleteProduit,
        getProduit,
        updateCompanySettings,
        resetToDefaultData,
      }}
    >
      {children}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-surface border-success/30 text-on-surface'
                : toast.type === 'error'
                ? 'bg-surface border-error/30 text-on-surface'
                : 'bg-surface border-primary/30 text-on-surface'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                toast.type === 'success'
                  ? 'text-success'
                  : toast.type === 'error'
                  ? 'text-error'
                  : 'text-primary'
              }`}
            >
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={hideToast}
              className="ml-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
