-- Creează tabelul pentru seturi
CREATE TABLE IF NOT EXISTS seturi (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    descriere TEXT
);

-- Creează tabelul pentru asocierea produselor în seturi
CREATE TABLE IF NOT EXISTS asociere_set (
    id SERIAL PRIMARY KEY,
    id_set INTEGER REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INTEGER REFERENCES feluri_mancare(id) ON DELETE CASCADE
);

-- Creează index pentru optimizare
CREATE INDEX idx_asociere_set_id_set ON asociere_set(id_set);
CREATE INDEX idx_asociere_set_id_produs ON asociere_set(id_produs);

-- Populează tabelul seturi
INSERT INTO seturi (nume, descriere) VALUES
('Festin Românesc', 'O selecție autentică de preparate tradiționale românești pentru o masă completă'),
('Deliciu Rusesc', 'Experiență culinară rusească ce include preparate reprezentative pentru această bucătărie'),
('Gust Italian', 'Preparate clasice italiene pentru o experiență mediteraneană completă'),
('Savoare Franceză', 'Combinație rafinată de preparate franțuzești pentru o cină specială'),
('Meniu Degustare Internațional', 'O călătorie gastronomică prin diverse bucătării ale lumii');

-- Populează tabelul asociere_set

-- 1. Festin Românesc: Sarmale + Mămăligă + Mici + Papanași
INSERT INTO asociere_set (id_set, id_produs) VALUES 
(1, 1),  -- Sarmale
(1, 5),  -- Mămăligă cu brânză și smântână
(1, 15), -- Mici
(1, 19); -- Papanași

-- 2. Deliciu Rusesc: Borș rusesc + Pelmeni + Beef Stroganoff + Pirozhki
INSERT INTO asociere_set (id_set, id_produs) VALUES 
(2, 2),  -- Borș rusesc
(2, 6),  -- Pelmeni
(2, 8),  -- Beef Stroganoff
(2, 20); -- Pirozhki

-- 3. Gust Italian: Pasta Carbonara + Risotto + Pizza Margherita + Tiramisu
INSERT INTO asociere_set (id_set, id_produs) VALUES 
(3, 3),  -- Pasta Carbonara
(3, 7),  -- Risotto cu ciuperci
(3, 13), -- Pizza Margherita
(3, 17); -- Tiramisu

-- 4. Savoare Franceză: Quiche Lorraine + Coq au Vin + Ratatouille + Bouillabaisse
INSERT INTO asociere_set (id_set, id_produs) VALUES 
(4, 10), -- Quiche Lorraine
(4, 4),  -- Coq au Vin
(4, 14), -- Ratatouille
(4, 18); -- Bouillabaisse

-- 5. Meniu Degustare Internațional: Blini cu caviar + Sarmale + Pasta Carbonara + Bouillabaisse + Tiramisu
INSERT INTO asociere_set (id_set, id_produs) VALUES 
(5, 12), -- Blini cu caviar (aperitiv rusesc)
(5, 1),  -- Sarmale (fel principal românesc)
(5, 3),  -- Pasta Carbonara (fel principal italian)
(5, 18), -- Bouillabaisse (fel principal francez)
(5, 17); -- Tiramisu (desert italian)