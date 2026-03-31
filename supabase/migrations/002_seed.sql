-- ══════════════════════════════════════════════
-- PlanOT — Données de seed
-- ══════════════════════════════════════════════

-- Habilitations de référence
INSERT INTO habilitations_ref (code, libelle, categorie, couleur) VALUES
('H0', 'Habilitation électrique H0 (non-électricien)', 'Électrique', '#EF4444'),
('B0', 'Habilitation électrique B0', 'Électrique', '#EF4444'),
('B2V', 'Habilitation électrique B2V', 'Électrique', '#DC2626'),
('BR', 'Habilitation électrique BR', 'Électrique', '#B91C1C'),
('BC', 'Habilitation électrique BC (consignation)', 'Électrique', '#991B1B'),
('PONTIER', 'Pontier / Élingueur', 'Levage', '#3B82F6'),
('CARISTE', 'Autorisation de conduite chariot élévateur', 'Levage', '#2563EB'),
('ATEX', 'Habilitation ATEX', 'Sécurité', '#F59E0B'),
('HAUTEUR', 'Travail en hauteur', 'Sécurité', '#F97316'),
('SOUDURE_ARC', 'Soudure à l''arc', 'Soudure', '#8B5CF6'),
('SOUDURE_TIG', 'Soudure TIG', 'Soudure', '#7C3AED'),
('SOUDURE_MIG', 'Soudure MIG/MAG', 'Soudure', '#6D28D9'),
('ESPACE_CONFINE', 'Intervention en espace confiné', 'Sécurité', '#EC4899'),
('CACES_R489', 'CACES R489 (chariots)', 'Levage', '#2563EB');

-- Machines de test
INSERT INTO machines (tag, designation, batiment, zone, criticite) VALUES
('WFL M35', 'WFL Millturn M35', 'A32', 'Zone 1', 'Goulot'),
('HERMLE C42', 'Hermle C42 U 5 axes', 'A32', 'Zone 1', 'Critique A'),
('HERMLE C50', 'Hermle C50 U 5 axes', 'A32', 'Zone 2', 'Critique A'),
('BERTHIEZ TVM', 'Berthiez TVM 1400', 'A53', 'Zone 1', 'Goulot'),
('NAKAMURA NTX', 'Nakamura NTX 2000', 'A53', 'Zone 1', 'Standard'),
('SIP HYDROPTIC', 'SIP Hydroptic 6A', 'A53', 'Zone 2', 'Critique A'),
('PROBEAM', 'Pro-Beam EBW', 'A32', 'Zone 3', 'Goulot'),
('STUDER S33', 'Studer S33 CNC', 'A53', 'Zone 2', 'Standard'),
('ECOCLEAN', 'Ecoclean EcoCcore', 'A32', 'Zone 2', 'Standard');

-- Techniciens de test
INSERT INTO techniciens (nom, prenom, specialite, equipe, telephone, actif) VALUES
('MARTIN', 'Sébastien', 'Mécanique', 'Équipe A', '06 12 34 56 78', true),
('DUBOIS', 'Stéphane', 'Électricité', 'Équipe A', '06 23 45 67 89', true),
('MOREAU', 'Pierre', 'Automatisme', 'Équipe B', '06 34 56 78 90', true),
('LEROY', 'Thomas', 'Mécanique', 'Équipe B', '06 45 67 89 01', true),
('ROUX', 'Pascal', 'Hydraulique', 'Journée', '06 56 78 90 12', true),
('FOURNIER', 'Adrien', 'Polyvalent', 'Journée', '06 67 89 01 23', true);

-- Assign habilitations to technicians
-- Sébastien: H0, PONTIER, HAUTEUR
INSERT INTO technicien_habilitations (technicien_id, habilitation_id, date_obtention, date_expiration)
SELECT t.id, h.id, '2024-01-15', '2027-01-15'
FROM techniciens t, habilitations_ref h
WHERE t.prenom = 'Sébastien' AND h.code IN ('H0', 'PONTIER', 'HAUTEUR');

-- Stéphane: B2V, BR, BC, H0
INSERT INTO technicien_habilitations (technicien_id, habilitation_id, date_obtention, date_expiration)
SELECT t.id, h.id, '2024-03-01', '2027-03-01'
FROM techniciens t, habilitations_ref h
WHERE t.prenom = 'Stéphane' AND h.code IN ('B2V', 'BR', 'BC', 'H0');

-- Pierre: B2V, BR, ATEX
INSERT INTO technicien_habilitations (technicien_id, habilitation_id, date_obtention, date_expiration)
SELECT t.id, h.id, '2024-06-01', '2027-06-01'
FROM techniciens t, habilitations_ref h
WHERE t.prenom = 'Pierre' AND h.code IN ('B2V', 'BR', 'ATEX');

-- Thomas: H0, PONTIER, CARISTE, SOUDURE_ARC
INSERT INTO technicien_habilitations (technicien_id, habilitation_id, date_obtention, date_expiration)
SELECT t.id, h.id, '2024-02-01', '2027-02-01'
FROM techniciens t, habilitations_ref h
WHERE t.prenom = 'Thomas' AND h.code IN ('H0', 'PONTIER', 'CARISTE', 'SOUDURE_ARC');

-- Pascal: H0, B0, PONTIER, ESPACE_CONFINE
INSERT INTO technicien_habilitations (technicien_id, habilitation_id, date_obtention, date_expiration)
SELECT t.id, h.id, '2024-04-01', '2027-04-01'
FROM techniciens t, habilitations_ref h
WHERE t.prenom = 'Pascal' AND h.code IN ('H0', 'B0', 'PONTIER', 'ESPACE_CONFINE');

-- Adrien: H0, BR, PONTIER, HAUTEUR, CACES_R489 (expiring soon!)
INSERT INTO technicien_habilitations (technicien_id, habilitation_id, date_obtention, date_expiration)
SELECT t.id, h.id, '2023-05-01',
  CASE WHEN h.code = 'CACES_R489' THEN '2026-04-15' ELSE '2026-05-01' END
FROM techniciens t, habilitations_ref h
WHERE t.prenom = 'Adrien' AND h.code IN ('H0', 'BR', 'PONTIER', 'HAUTEUR', 'CACES_R489');

-- Absences de test
INSERT INTO technicien_absences (technicien_id, type_absence, debut, fin, commentaire)
SELECT t.id, 'Congé',
  (CURRENT_DATE + INTERVAL '2 days')::timestamptz,
  (CURRENT_DATE + INTERVAL '5 days')::timestamptz,
  'Congés annuels'
FROM techniciens t WHERE t.prenom = 'Pierre';

INSERT INTO technicien_absences (technicien_id, type_absence, debut, fin, commentaire)
SELECT t.id, 'Formation',
  (CURRENT_DATE + INTERVAL '1 day')::timestamptz,
  (CURRENT_DATE + INTERVAL '2 days')::timestamptz,
  'Formation habilitation électrique'
FROM techniciens t WHERE t.prenom = 'Thomas';

-- OT de test
INSERT INTO ordres_travail (numero_ot, machine_id, description, type_ot, priorite, duree_estimee_h, competences_requises, statut, batiment) VALUES
('BT-2024-001', (SELECT id FROM machines WHERE tag = 'WFL M35'), 'Remplacement roulement broche principale', 'CORPAN', 1, 8.0, ARRAY['PONTIER', 'H0'], 'À planifier', 'A32'),
('BT-2024-002', (SELECT id FROM machines WHERE tag = 'WFL M35'), 'Contrôle géométrique après intervention', 'PREV', 3, 2.0, NULL, 'À planifier', 'A32'),
('BT-2024-003', (SELECT id FROM machines WHERE tag = 'WFL M35'), 'Remplacement joint tournant hydraulique', 'CORPL', 2, 4.0, ARRAY['H0'], 'À planifier', 'A32'),
('BT-2024-004', (SELECT id FROM machines WHERE tag = 'HERMLE C42'), 'Vidange groupe hydraulique', 'PREV', 3, 1.5, NULL, 'À planifier', 'A32'),
('BT-2024-005', (SELECT id FROM machines WHERE tag = 'HERMLE C42'), 'Calibration palpeur Renishaw', 'PREV', 2, 1.0, NULL, 'À planifier', 'A32'),
('BT-2024-006', (SELECT id FROM machines WHERE tag = 'HERMLE C42'), 'Remplacement courroie axe B', 'CORPL', 2, 3.0, ARRAY['H0'], 'À planifier', 'A32'),
('BT-2024-007', (SELECT id FROM machines WHERE tag = 'HERMLE C50'), 'Nettoyage filtres armoire électrique', 'PREV', 4, 0.5, ARRAY['BR'], 'À planifier', 'A32'),
('BT-2024-008', (SELECT id FROM machines WHERE tag = 'HERMLE C50'), 'Remplacement capteur température broche', 'CORPAN', 1, 3.0, ARRAY['BR', 'H0'], 'À planifier', 'A32'),
('BT-2024-009', (SELECT id FROM machines WHERE tag = 'HERMLE C50'), 'Mise à jour programme automate sécurité', 'MODIF', 2, 4.0, ARRAY['BR', 'ATEX'], 'À planifier', 'A32'),
('BT-2024-010', (SELECT id FROM machines WHERE tag = 'BERTHIEZ TVM'), 'Remplacement variateur axe C', 'CORPAN', 1, 6.0, ARRAY['BR', 'BC', 'PONTIER'], 'À planifier', 'A53'),
('BT-2024-011', (SELECT id FROM machines WHERE tag = 'BERTHIEZ TVM'), 'Contrôle niveaux et vidange', 'PREV', 3, 2.0, NULL, 'À planifier', 'A53'),
('BT-2024-012', (SELECT id FROM machines WHERE tag = 'BERTHIEZ TVM'), 'Réparation fuite circuit de refroidissement', 'CORPL', 2, 3.0, ARRAY['H0'], 'À planifier', 'A53'),
('BT-2024-013', (SELECT id FROM machines WHERE tag = 'NAKAMURA NTX'), 'Remplacement joints tourelle', 'PREV', 3, 2.5, ARRAY['H0'], 'À planifier', 'A53'),
('BT-2024-014', (SELECT id FROM machines WHERE tag = 'NAKAMURA NTX'), 'Réglage pression de serrage mandrin', 'COR_PLANIF', 3, 1.0, NULL, 'À planifier', 'A53'),
('BT-2024-015', (SELECT id FROM machines WHERE tag = 'NAKAMURA NTX'), 'Remplacement capteur porte', 'CORPAN', 2, 1.5, ARRAY['BR'], 'À planifier', 'A53'),
('BT-2024-016', (SELECT id FROM machines WHERE tag = 'SIP HYDROPTIC'), 'Remplacement pompe hydraulique principale', 'CORPAN', 1, 6.0, ARRAY['H0', 'PONTIER'], 'À planifier', 'A53'),
('BT-2024-017', (SELECT id FROM machines WHERE tag = 'SIP HYDROPTIC'), 'Contrôle pression accumulateurs', 'PREV', 3, 1.0, NULL, 'À planifier', 'A53'),
('BT-2024-018', (SELECT id FROM machines WHERE tag = 'SIP HYDROPTIC'), 'Remplacement filtre air armoire', 'PREV', 4, 0.5, NULL, 'À planifier', 'A53'),
('BT-2024-019', (SELECT id FROM machines WHERE tag = 'PROBEAM'), 'Maintenance pompes à vide', 'PREV', 2, 4.0, ARRAY['ATEX', 'H0'], 'À planifier', 'A32'),
('BT-2024-020', (SELECT id FROM machines WHERE tag = 'PROBEAM'), 'Remplacement filament cathode', 'CORPAN', 1, 8.0, ARRAY['BR', 'HAUTEUR'], 'À planifier', 'A32'),
('BT-2024-021', (SELECT id FROM machines WHERE tag = 'PROBEAM'), 'Étalonnage système de déflection', 'PREV', 2, 3.0, ARRAY['BR'], 'À planifier', 'A32'),
('BT-2024-022', (SELECT id FROM machines WHERE tag = 'STUDER S33'), 'Remplacement meule et dressage', 'PREV', 3, 2.0, ARRAY['H0'], 'À planifier', 'A53'),
('BT-2024-023', (SELECT id FROM machines WHERE tag = 'STUDER S33'), 'Contrôle et réglage lunette', 'COR_PLANIF', 3, 1.5, NULL, 'À planifier', 'A53'),
('BT-2024-024', (SELECT id FROM machines WHERE tag = 'STUDER S33'), 'Remplacement codeur axe X', 'CORPAN', 2, 3.0, ARRAY['BR'], 'À planifier', 'A53'),
('BT-2024-025', (SELECT id FROM machines WHERE tag = 'ECOCLEAN'), 'Remplacement bain de nettoyage', 'PREV', 3, 2.0, ARRAY['ESPACE_CONFINE'], 'À planifier', 'A32'),
('BT-2024-026', (SELECT id FROM machines WHERE tag = 'ECOCLEAN'), 'Contrôle étanchéité cuve', 'PREV', 4, 1.0, NULL, 'À planifier', 'A32'),
('BT-2024-027', (SELECT id FROM machines WHERE tag = 'ECOCLEAN'), 'Remplacement résistances chauffage', 'CORPL', 2, 2.5, ARRAY['BR', 'H0'], 'À planifier', 'A32'),
('BT-2024-028', (SELECT id FROM machines WHERE tag = 'WFL M35'), 'Inspection caméra canal de broche', 'PREV', 3, 1.5, NULL, 'À planifier', 'A32'),
('BT-2024-029', (SELECT id FROM machines WHERE tag = 'HERMLE C42'), 'Remplacement vis à billes axe Y', 'CORPL', 1, 12.0, ARRAY['PONTIER', 'H0'], 'À planifier', 'A32'),
('BT-2024-030', (SELECT id FROM machines WHERE tag = 'BERTHIEZ TVM'), 'Modification programme CN sécurité porte', 'MODIF', 3, 2.0, ARRAY['BR'], 'À planifier', 'A53'),
('BT-2024-031', (SELECT id FROM machines WHERE tag = 'NAKAMURA NTX'), 'Remplacement pompe de lubrification', 'CORPL', 2, 2.0, ARRAY['H0'], 'À planifier', 'A53'),
('BT-2024-032', (SELECT id FROM machines WHERE tag = 'PROBEAM'), 'Contrôle alignement optique', 'PREV', 2, 2.0, ARRAY['HAUTEUR'], 'À planifier', 'A32'),
('BT-2024-033', (SELECT id FROM machines WHERE tag = 'SIP HYDROPTIC'), 'Remplacement distributeur hydraulique', 'CORPAN', 2, 5.0, ARRAY['H0', 'PONTIER'], 'À planifier', 'A53'),
('BT-2024-034', (SELECT id FROM machines WHERE tag = 'HERMLE C50'), 'Remplacement électrovanne arrosage', 'CORPL', 3, 1.5, ARRAY['BR'], 'À planifier', 'A32'),
('BT-2024-035', (SELECT id FROM machines WHERE tag = 'STUDER S33'), 'Calibration système de mesure en process', 'PREV', 2, 2.5, NULL, 'À planifier', 'A53');

-- Créneaux de disponibilité machine (semaine courante)
INSERT INTO machine_disponibilites (machine_id, debut, fin, commentaire, created_by) VALUES
((SELECT id FROM machines WHERE tag = 'WFL M35'),
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '6 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '18 hours')::timestamptz,
  'Arrêt production confirmé', 'Référent méthodes'),
((SELECT id FROM machines WHERE tag = 'WFL M35'),
  (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '8 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '12 hours')::timestamptz,
  'Créneau matin', 'Référent méthodes'),
((SELECT id FROM machines WHERE tag = 'HERMLE C42'),
  (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '6 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '22 hours')::timestamptz,
  'Machine libérée toute la journée', 'Chef d''atelier'),
((SELECT id FROM machines WHERE tag = 'HERMLE C50'),
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '22 hours')::timestamptz,
  'Après-midi libre', 'Chef d''atelier'),
((SELECT id FROM machines WHERE tag = 'BERTHIEZ TVM'),
  (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '6 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '14 hours')::timestamptz,
  'Créneau matin', 'Référent méthodes'),
((SELECT id FROM machines WHERE tag = 'PROBEAM'),
  (CURRENT_DATE + INTERVAL '4 days' + INTERVAL '6 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '4 days' + INTERVAL '18 hours')::timestamptz,
  'Arrêt programmé', 'Référent méthodes'),
((SELECT id FROM machines WHERE tag = 'NAKAMURA NTX'),
  (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '14 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '22 hours')::timestamptz,
  'Créneau après-midi', 'Chef d''atelier'),
((SELECT id FROM machines WHERE tag = 'SIP HYDROPTIC'),
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '6 hours')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours')::timestamptz,
  'Créneau matin', 'Référent méthodes');
