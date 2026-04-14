-- ══════════════════════════════════════════════
-- PlanOT — Table des demandeurs pour les demandes PDR
-- ══════════════════════════════════════════════

CREATE TABLE pdr_demandeurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pdr_demandeurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON pdr_demandeurs FOR ALL USING (true) WITH CHECK (true);
