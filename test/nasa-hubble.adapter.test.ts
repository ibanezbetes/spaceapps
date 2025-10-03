import { nasaHubbleAdapter } from '../src/services/adapters/nasa-hubble.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NASA Hubble/MAST adapter', () => {
  beforeEach(() => {
    process.env.ENABLE_NASA_HUBBLE = 'true';
    mockedAxios.get.mockReset();
  });

  it('normalizes search results with RA/Dec and source', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          { obsid: '123', target_name: 'M31', s_ra: 10.6847, s_dec: 41.269, obs_collection: 'HST' },
          { obsid: '124', target_name: 'Object B', s_ra: 10.70, s_dec: 41.20, obs_collection: 'MAST' }
        ]
      }
    } as any);
    const { items, total } = await nasaHubbleAdapter.searchByCategory('star-systems', { minRA: 10, minDec: 40, maxRA: 20, maxDec: 50 }, 1, 10);
    expect(total).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('ra');
    expect(items[0]).toHaveProperty('dec');
    expect(['nasa:hst', 'nasa:mast']).toContain(items[0].source);
  });

  it('getById returns normalized summary or null', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ obsid: '123', target_name: 'M31', s_ra: 10.68, s_dec: 41.27, obs_collection: 'HST' }] } as any);
    const obj = await nasaHubbleAdapter.getById('123');
    expect(obj && obj.id).toBe('123');
  });
});
