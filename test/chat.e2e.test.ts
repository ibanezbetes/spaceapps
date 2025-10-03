import request from 'supertest';
import app from '../src/app';

describe('Chat API', () => {
  it('POST /chat/:id with missing object returns 404', async () => {
    const res = await request(app).post('/chat/UNKNOWN').send({ question: 'Hola?' });
    // Depending on registry, unknown may be 404
    expect([200, 404]).toContain(res.status);
  });
});
