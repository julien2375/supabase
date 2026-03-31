-- ══════════════════════════════════════════════
-- PlanOT — Schema de base de données
-- ══════════════════════════════════════════════

-- TABLE : machines
CREATE TABLE machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag VARCHAR(50) NOT NULL UNIQUE,
  designation VARCHAR(200),
  batiment VARCHAR(20),
  zone VARCHAR(50),
  criticite VARCHAR(20) DEFAULT 'Standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : machine_disponibilites
CREATE TABLE machine_disponibilites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  debut TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  commentaire TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (fin > debut)
);

-- TABLE : habilitations_ref
CREATE TABLE habilitations_ref (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  libelle VARCHAR(100) NOT NULL,
  categorie VARCHAR(50),
  couleur VARCHAR(7) DEFAULT '#6B7280'
);

-- TABLE : techniciens
CREATE TABLE techniciens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  specialite VARCHAR(50),
  equipe VARCHAR(50),
  telephone VARCHAR(20),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : technicien_habilitations
CREATE TABLE technicien_habilitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technicien_id UUID REFERENCES techniciens(id) ON DELETE CASCADE,
  habilitation_id UUID REFERENCES habilitations_ref(id) ON DELETE CASCADE,
  date_obtention DATE,
  date_expiration DATE,
  UNIQUE(technicien_id, habilitation_id)
);

-- TABLE : technicien_absences
CREATE TABLE technicien_absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technicien_id UUID REFERENCES techniciens(id) ON DELETE CASCADE,
  type_absence VARCHAR(30) NOT NULL,
  debut TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  commentaire TEXT,
  CONSTRAINT check_absence_dates CHECK (fin > debut)
);

-- TABLE : ordres_travail (OT)
CREATE TABLE ordres_travail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ot VARCHAR(30) NOT NULL,
  machine_id UUID REFERENCES machines(id),
  description TEXT,
  type_ot VARCHAR(30),
  priorite INTEGER DEFAULT 3,
  duree_estimee_h DECIMAL(6,2),
  competences_requises TEXT[],
  statut VARCHAR(30) DEFAULT 'À planifier',
  date_creation_gmao DATE,
  date_planifiee_gmao DATE,
  batiment VARCHAR(20),
  import_batch_id VARCHAR(50),
  donnees_brutes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : interventions_planifiees
CREATE TABLE interventions_planifiees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre VARCHAR(200),
  machine_id UUID REFERENCES machines(id),
  disponibilite_id UUID REFERENCES machine_disponibilites(id),
  debut TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ NOT NULL,
  statut VARCHAR(30) DEFAULT 'Planifié',
  commentaire TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : intervention_ots
CREATE TABLE intervention_ots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intervention_id UUID REFERENCES interventions_planifiees(id) ON DELETE CASCADE,
  ot_id UUID REFERENCES ordres_travail(id) ON DELETE CASCADE,
  ordre INTEGER DEFAULT 0,
  UNIQUE(intervention_id, ot_id)
);

-- TABLE : intervention_techniciens
CREATE TABLE intervention_techniciens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intervention_id UUID REFERENCES interventions_planifiees(id) ON DELETE CASCADE,
  technicien_id UUID REFERENCES techniciens(id) ON DELETE CASCADE,
  role VARCHAR(50),
  UNIQUE(intervention_id, technicien_id)
);

-- INDEXES
CREATE INDEX idx_ot_machine ON ordres_travail(machine_id);
CREATE INDEX idx_ot_statut ON ordres_travail(statut);
CREATE INDEX idx_ot_priorite ON ordres_travail(priorite);
CREATE INDEX idx_intervention_dates ON interventions_planifiees(debut, fin);
CREATE INDEX idx_intervention_machine ON interventions_planifiees(machine_id);
CREATE INDEX idx_absence_dates ON technicien_absences(debut, fin);
CREATE INDEX idx_dispo_machine ON machine_disponibilites(machine_id, debut, fin);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE interventions_planifiees;
ALTER PUBLICATION supabase_realtime ADD TABLE intervention_ots;
ALTER PUBLICATION supabase_realtime ADD TABLE intervention_techniciens;
ALTER PUBLICATION supabase_realtime ADD TABLE ordres_travail;
ALTER PUBLICATION supabase_realtime ADD TABLE machine_disponibilites;

-- ROW LEVEL SECURITY (allow all for MVP)
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniciens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordres_travail ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions_planifiees ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_disponibilites ENABLE ROW LEVEL SECURITY;
ALTER TABLE habilitations_ref ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicien_habilitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicien_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_ots ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_techniciens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON techniciens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ordres_travail FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON interventions_planifiees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON machine_disponibilites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON habilitations_ref FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON technicien_habilitations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON technicien_absences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON intervention_ots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON intervention_techniciens FOR ALL USING (true) WITH CHECK (true);
