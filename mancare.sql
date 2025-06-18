DROP TYPE IF EXISTS tip_fel;
DROP TYPE IF EXISTS tip_bucatarie;

CREATE TYPE tip_fel AS ENUM('aperitiv', 'fel_principal', 'garnitura', 'desert', 'traditional', 'festiv', 'street_food');
CREATE TYPE tip_bucatarie AS ENUM('romaneasca', 'ruseasca', 'italiana', 'franceza', 'chinezeasca', 'mediteraneana', 'americana');

CREATE TABLE IF NOT EXISTS feluri_mancare (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   gramaj_portie INT NOT NULL CHECK (gramaj_portie>=0),   
   bucatarie tip_bucatarie NOT NULL,
   timp_preparare INT NOT NULL CHECK (timp_preparare>=0), -- în minute
   tip_fel tip_fel DEFAULT 'fel_principal',
   ingrediente VARCHAR [], 
   vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO feluri_mancare (nume, descriere, pret, gramaj_portie, bucatarie, timp_preparare, tip_fel, ingrediente, vegetarian, imagine) VALUES 
('Sarmale', 'Preparatul tradițional românesc învelit în foi de varză sau viță de vie, umplut cu carne și orez', 30, 350, 'romaneasca', 180, 'traditional', '{"carne tocata","orez","ceapa","varza murata","morcov","ardei","bulion"}', False, 'sarmale.jpg'),

('Borș rusesc', 'Supă acidulată tradițională rusească cu sfeclă roșie și legume de sezon', 22, 400, 'ruseasca', 90, 'traditional', '{"sfecla rosie","varza","cartofi","ceapa","morcovi","smantana","lamaie"}', True, 'bors-rusesc.jpg'),

('Pasta Carbonara', 'Paste autentice italiene cu sos cremos din ou, brânză Pecorino Romano, guanciale și piper negru', 35, 320, 'italiana', 30, 'fel_principal', '{"spaghete","ou","guanciale","pecorino romano","piper negru"}', False, 'carbonara.jpg'),

('Coq au Vin', 'Rețetă clasică franceză de pui gătit lent în vin roșu cu legume și ierburi', 45, 400, 'franceza', 120, 'fel_principal', '{"pui","vin rosu","ceapa","morcov","ciuperci","usturoi","ierburi aromatice"}', False, 'coq-au-vin.jpg'),

('Mămăligă cu brânză și smântână', 'Mămăligă tradițională românească servită cu brânză de burduf și smântână', 18, 300, 'romaneasca', 30, 'traditional', '{"malai","apa","sare","branza de burduf","smantana"}', True, 'mamaliga.jpg'),

('Pelmeni', 'Colțunași rusești umpluți cu carne tocată, serviți cu smântână', 28, 350, 'ruseasca', 60, 'traditional', '{"faina","oua","carne tocata","ceapa","unt","smantana"}', False, 'pelmeni.jpg'),

('Risotto cu ciuperci', 'Orez cremos italian gătit lent cu ciuperci porcini și parmezan', 32, 320, 'italiana', 45, 'fel_principal', '{"orez arborio","ciuperci porcini","ceapa","vin alb","parmezan","unt"}', True, 'risotto-ciuperci.jpg'),

('Beef Stroganoff', 'Preparat rusesc din bucăți de vită în sos cremos cu ciuperci și smântână', 40, 380, 'ruseasca', 50, 'fel_principal', '{"vita","ciuperci","ceapa","smantana","mustar","patrunjel"}', False, 'beef-stroganoff.jpg'),

('Lasagna', 'Straturi de paste, ragu de carne, sos bechamel și brânză, coapte la cuptor', 37, 450, 'italiana', 90, 'fel_principal', '{"paste lasagna","carne tocata","sos tomat","morcov","ceapa","sos bechamel","mozzarella","parmezan"}', False, 'lasagna.jpg'),

('Quiche Lorraine', 'Tartă sărata franceză cu bacon crocant și cremă de ou', 26, 250, 'franceza', 75, 'aperitiv', '{"aluat foietaj","bacon","ou","smantana","branza gruyere","nucsoara"}', False, 'quiche-lorraine.jpg'),

('Ciorbă de burtă', 'Ciorbă aromată și consistentă din burtă de vită, legume și smântână', 25, 400, 'romaneasca', 120, 'traditional', '{"burta de vita","morcovi","telina","ceapa","oua","smantana","usturoi"}', False, 'ciorba-burta.jpg'),

('Blini cu caviar', 'Clătite subțiri rusești servite cu caviar negru și smântână', 85, 180, 'ruseasca', 30, 'aperitiv', '{"faina","lapte","oua","unt","caviar","smantana"}', False, 'blini-caviar.jpg'),

('Pizza Margherita', 'Pizza clasică italiană cu sos de roșii, mozzarella și busuioc', 29, 350, 'italiana', 25, 'fel_principal', '{"aluat pizza","sos tomat","mozzarella","busuioc","ulei de masline"}', True, 'pizza-margherita.jpg'),

('Ratatouille', 'Tocăniță provensală din legume coapte în sos de roșii aromat', 24, 300, 'franceza', 60, 'garnitura', '{"vinete","dovlecei","ardei","ceapa","rosii","usturoi","ierburi provence"}', True, 'ratatouille.jpg'),

('Mici', 'Rulouri din carne tocată condimentată, preparate la grătar', 20, 250, 'romaneasca', 40, 'street_food', '{"carne tocata de vita","carne tocata de miel","carne tocata de porc","usturoi","bicarbonat","condimente"}', False, 'mici.jpg'),

('Okroshka', 'Supă rece tradițională rusească preparată cu legume proaspete, ou fiert, carne și kvas (băutură fermentată)', 24, 380, 'ruseasca', 45, 'traditional', '{"castraveti","ridichi","ceapa verde","ou fiert","cartofi fierti","sunca","kvas","smantana","marar"}', False, 'okroska.jpg'),

('Tiramisu', 'Desert italian cremos cu mascarpone, cafea și pișcoturi', 22, 200, 'italiana', 30, 'desert', '{"piscoturi","mascarpone","cafea","oua","zahar","cacao"}', False, 'tiramisu.jpg'),

('Bouillabaisse', 'Supă de pește tradițională din Marsilia cu diverse tipuri de pește și fructe de mare', 50, 450, 'franceza', 90, 'fel_principal', '{"peste alb","creveti","midii","ceapa","telina","rosii","sofran","ierburi aromatice"}', False, 'bouillabaisse.jpg'),

('Papanași', 'Desert românesc din brânză de vaci, serviți cu smântână și dulceață', 18, 280, 'romaneasca', 45, 'desert', '{"branza de vaci","faina","oua","zahar","smantana","dulceata"}', False, 'papanasi.jpg'),

('Pirozhki', 'Brioșe rusești umplute cu carne sau legume', 15, 200, 'ruseasca', 60, 'street_food', '{"faina","drojdie","lapte","carne tocata","ceapa","morcovi","oua"}', False, 'pirozhki.jpg');

