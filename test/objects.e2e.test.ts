import request from 'supertest';
import app from '../src/app';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Objects API', () => {
  beforeAll(() => {
    process.env.ENABLE_NASA_HUBBLE = 'true';
  });

  it('GET /objects requires category', async () => {
    const res = await request(app).get('/objects');
    expect(res.status).toBe(400);
  });

  it('GET /objects planets with bbox returns 200 (baseline)', async () => {
    const res = await request(app).get('/objects?category=planets&bbox=10,40,20,50&limit=10');
    expect(res.status).toBe(200);
  });

  it('GET /objects star-systems with bbox returns items (MAST mocked)', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [{ obsid: 'm31a', target_name: 'M31', s_ra: 10.6847, s_dec: 41.269, obs_collection: 'HST' }] }
    } as any);
    const res = await request(app).get('/objects?category=star-systems&bbox=10,40,20,50&limit=100');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    if (res.body.items.length) {
      expect(res.body.items[0]).toHaveProperty('ra');
      expect(res.body.items[0]).toHaveProperty('dec');
    }
  });
});
 
