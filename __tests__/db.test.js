const { Pool } = require('pg');
const pool = new Pool();

test('Database query returns expected results', async () => {
    const res = await pool.query('SELECT * FROM your_table_name');
    expect(res.rows).toBeDefined();
    expect(res.rowCount).toBeGreaterThan(0);
    res.rows.forEach(row => {
        expect(row).toHaveProperty('id');
        expect(row).toHaveProperty('nume');
        expect(row).toHaveProperty('descriere');
        expect(row).toHaveProperty('pret');
        expect(row).toHaveProperty('gramaj');
        expect(row).toHaveProperty('categorie');
        expect(row).toHaveProperty('ingrediente');
        expect(row).toHaveProperty('imagine');
        expect(row).toHaveProperty('data_adaugare');
    });
});