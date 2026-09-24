-- ================================================================
-- GESTPRO ERP - SCHEMA SUPABASE COMPLET AVEC ROW LEVEL SECURITY (RLS)
-- ================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE PROFILES (Liée aux utilisateurs authentifiés)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leur profil" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur profil" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur profil" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. TABLE COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT DEFAULT 'GestPro S.A.S',
  email TEXT,
  phone TEXT,
  address TEXT,
  siret TEXT,
  tva_number TEXT,
  currency TEXT DEFAULT 'FCFA',
  language TEXT DEFAULT 'fr',
  invoice_prefix TEXT DEFAULT 'FAC-2026-',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès aux paramètres de l'entreprise" 
ON public.company_settings FOR ALL USING (auth.uid() = user_id);

-- 4. TABLE CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  entreprise TEXT,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  ville TEXT,
  code_postal TEXT,
  pays TEXT DEFAULT 'Sénégal',
  ninea TEXT,
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif')),
  commandes_count INT DEFAULT 0,
  total_depense NUMERIC(15, 2) DEFAULT 0,
  solde_du NUMERIC(15, 2) DEFAULT 0,
  delai_paiement TEXT DEFAULT '14 Jours',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès aux clients de l'utilisateur" 
ON public.clients FOR ALL USING (auth.uid() = user_id);

-- 5. TABLE COMMANDES
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_nom TEXT NOT NULL,
  client_email TEXT,
  date_creation TEXT NOT NULL,
  date_livraison TEXT,
  creee_par TEXT,
  statut TEXT DEFAULT 'attente' CHECK (statut IN ('attente', 'confirmee', 'preparation', 'livree', 'annulee')),
  articles JSONB DEFAULT '[]'::jsonb,
  total_ht NUMERIC(15, 2) DEFAULT 0,
  tva NUMERIC(15, 2) DEFAULT 0,
  total_ttc NUMERIC(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès aux commandes de l'utilisateur" 
ON public.commandes FOR ALL USING (auth.uid() = user_id);

-- 6. TABLE FACTURES
CREATE TABLE IF NOT EXISTS public.factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  commande_id UUID REFERENCES public.commandes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_nom TEXT NOT NULL,
  client_adresse TEXT,
  client_email TEXT,
  client_siret TEXT,
  statut TEXT DEFAULT 'attente' CHECK (statut IN ('payee', 'attente', 'retard', 'brouillon')),
  articles JSONB DEFAULT '[]'::jsonb,
  total_ht NUMERIC(15, 2) DEFAULT 0,
  tva NUMERIC(15, 2) DEFAULT 0,
  total_ttc NUMERIC(15, 2) DEFAULT 0,
  reste_du NUMERIC(15, 2) DEFAULT 0,
  montant_paye NUMERIC(15, 2) DEFAULT 0,
  date_emission TEXT NOT NULL,
  date_echeance TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès aux factures de l'utilisateur" 
ON public.factures FOR ALL USING (auth.uid() = user_id);

-- 7. TABLE PAIEMENTS
CREATE TABLE IF NOT EXISTS public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  facture_id UUID REFERENCES public.factures(id) ON DELETE SET NULL,
  facture_numero TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_nom TEXT NOT NULL,
  montant NUMERIC(15, 2) NOT NULL,
  devise TEXT DEFAULT 'FCFA',
  methode TEXT DEFAULT 'virement' CHECK (methode IN ('virement', 'carte', 'cheque', 'especes')),
  date TEXT NOT NULL,
  statut TEXT DEFAULT 'reussi' CHECK (statut IN ('reussi', 'attente', 'echoue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès aux paiements de l'utilisateur" 
ON public.paiements FOR ALL USING (auth.uid() = user_id);

-- 8. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS public.produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  sku TEXT NOT NULL,
  categorie TEXT DEFAULT 'Autre',
  description TEXT,
  prix_ht NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tva NUMERIC(5, 2) DEFAULT 20,
  stock INT DEFAULT 0,
  statut TEXT DEFAULT 'disponible' CHECK (statut IN ('disponible', 'rupture', 'reapprovisionnement')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès aux produits de l'utilisateur" 
ON public.produits FOR ALL USING (auth.uid() = user_id);

-- 9. TRIGGER AUTOMATIQUE À L'INSCRIPTION D'UN NOUVEL UTILISATEUR
-- Crée automatiquement le profil et les paramètres d'entreprise
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'company_name', '')
  );

  INSERT INTO public.company_settings (user_id, company_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'company_name', 'GestPro S.A.S'),
    new.email
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
