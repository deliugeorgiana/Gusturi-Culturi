-- Crearea tipului enum pentru categoria mare
CREATE TYPE categorie_mare AS ENUM('aperitive', 'feluri_principale', 'deserturi', 'bauturi', 'traditionale');

-- Crearea tabelului de produse
CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    descriere TEXT,
    imagine VARCHAR(200),
    categorie categorie_mare NOT NULL,
    subcategorie VARCHAR(50),
    pret NUMERIC(8, 2) NOT NULL,
    timp_preparare INT, -- a doua caracteristică numerică (minute)
    data_adaugare DATE NOT NULL DEFAULT CURRENT_DATE,
    tip_bucatarie VARCHAR(50), -- caracteristica cu valoare unică
    ingrediente TEXT, -- caracteristică multi-valoare (separate prin virgulă)
    vegetarian BOOLEAN DEFAULT FALSE -- caracteristică booleană
);

-- Adăugare produse de test
INSERT INTO produse (nume, descriere, imagine, categorie, subcategorie, pret, timp_preparare, data_adaugare, tip_bucatarie, ingrediente, vegetarian) VALUES
('Sarmale tradiționale', 'Sarmale românești cu mămăliguță și smântână', 'resurse/imagini/produse/sarmale.jpg', 'traditionale', 'preparate_din_carne', 35.99, 120, '2023-12-10', 'românească', 'varză, carne tocată, orez, ceapă, morcov', FALSE),
('Ciorbă de burtă', 'Ciorbă tradițională de burtă cu smântână și ardei iute', 'resurse/imagini/produse/ciorba_burta.jpg', 'aperitive', 'ciorbe', 25.50, 90, '2023-11-15', 'românească', 'burtă de vită, morcovi, țelină, smântână, ou, usturoi', FALSE),
('Papanași', 'Papanași cu smântână și dulceață de afine', 'resurse/imagini/produse/papanasi.jpg', 'deserturi', 'dulciuri_traditionale', 28.50, 45, '2024-01-05', 'românească', 'brânză de vaci, făină, ouă, zahăr, dulceață de afine', TRUE),
('Pizza Margherita', 'Pizza clasică italiană cu roșii și mozzarella', 'resurse/imagini/produse/pizza_margherita.jpg', 'feluri_principale', 'pizza', 32.00, 30, '2024-02-20', 'italiană', 'aluat, sos de roșii, mozzarella, busuioc', TRUE),
('Burger de vită', 'Burger suculent cu carne de vită și cartofi prăjiți', 'resurse/imagini/produse/burger.jpg', 'feluri_principale', 'fast_food', 38.50, 25, '2023-10-10', 'americană', 'chiflă, carne de vită, salată, roșii, castraveți murați, sos', FALSE),
('Limonadă cu miere', 'Limonadă răcoritoare cu miere și mentă', 'resurse/imagini/produse/limonada.jpg', 'bauturi', 'racoritoare', 18.00, 10, '2024-04-15', 'internațională', 'lămâie, apă, miere, mentă', TRUE),
('Tiramisu', 'Desert italian clasic cu mascarpone și cafea', 'resurse/imagini/produse/tiramisu.jpg', 'deserturi', 'internationale', 26.50, 180, '2023-09-20', 'italiană', 'pișcoturi, cafea, mascarpone, ouă, cacao', TRUE),
('Musaca', 'Musaca grecească cu vinete și carne tocată', 'resurse/imagini/produse/musaca.jpg', 'feluri_principale', 'preparate_la_cuptor', 40.00, 90, '2024-03-05', 'grecească', 'vinete, carne tocată, cartofi, ceapă, sos bechamel', FALSE),
('Supă cremă de legume', 'Supă cremă de legume de sezon', 'resurse/imagini/produse/supa_crema.jpg', 'aperitive', 'supe', 22.00, 45, '2024-01-25', 'internațională', 'morcovi, țelină, cartofi, ceapă, smântână', TRUE),
('Plăcintă cu mere', 'Plăcintă dulce cu mere și scorțișoară', 'resurse/imagini/produse/placinta_mere.jpg', 'deserturi', 'placinte', 24.00, 60, '2023-10-15', 'internațională', 'făină, unt, mere, zahăr, scorțișoară', TRUE),
('Paste Carbonara', 'Paste în sos cremos cu pancetta și parmezan', 'resurse/imagini/produse/paste_carbonara.jpg', 'feluri_principale', 'paste', 36.00, 25, '2024-02-10', 'italiană', 'paste, pancetta, parmezan, ouă, piper negru', FALSE),
('Risotto cu ciuperci', 'Risotto cremos cu ciuperci sălbatice', 'resurse/imagini/produse/risotto.jpg', 'feluri_principale', 'orez', 34.50, 40, '2024-04-01', 'italiană', 'orez arborio, ciuperci, ceapă, vin alb, parmezan', TRUE),
('Salată grecească', 'Salată clasică grecească cu brânză feta', 'resurse/imagini/produse/salata_greceasca.jpg', 'aperitive', 'salate', 28.00, 15, '2024-03-20', 'grecească', 'roșii, castraveți, ardei, ceapă roșie, brânză feta, măsline', TRUE),
('Guacamole', 'Pastă de avocado cu tortilla chips', 'resurse/imagini/produse/guacamole.jpg', 'aperitive', 'antreuri_reci', 26.00, 15, '2023-11-05', 'mexicană', 'avocado, ceapă roșie, roșii, ardei iute, lime', TRUE),
('Ceai de ghimbir', 'Ceai aromat cu ghimbir și miere', 'resurse/imagini/produse/ceai_ghimbir.jpg', 'bauturi', 'ceaiuri', 15.00, 10, '2024-01-15', 'asiatică', 'apă, ghimbir, miere, lămâie', TRUE);