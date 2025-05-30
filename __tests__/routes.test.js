const request = require('supertest');
const app = require('../app');

describe('Routes', () => {
    it('should return 404 for non-existent routes', async () => {
        const response = await request(app).get('/non-existent-route');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            identificator: 404,
            status: true,
            titlu: '404 - N-am, bre!',
            text: 'Nu-i pe serverul ăsta, sorry, caută în altă parte!',
            imagine: '\\resurse\\imagini\\erori\\lupa.png'
        });
    });

    it('should return 403 for forbidden access', async () => {
        const response = await request(app).get('/forbidden-route');
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            identificator: 403,
            status: true,
            titlu: '403 - Da, tu ce cauți aici?!!',
            text: 'Ai greșit ruta. Stânga-împrejur și pa!',
            imagine: '\\resurse\\imagini\\erori\\interzis.png'
        });
    });

    it('should return 400 for bad requests', async () => {
        const response = await request(app).post('/bad-request-route').send({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            identificator: 400,
            status: true,
            titlu: '400 - bad request',
            text: 'Cerere gresita',
            imagine: '\\resurse\\imagini\\erori\\interzis.png'
        });
    });
});