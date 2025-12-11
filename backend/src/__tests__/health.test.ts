import request from 'supertest';
import express, { Express } from 'express';
import { createHealthRouter } from '../routes/health';

describe('Health Check Endpoint', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use('/api/health', createHealthRouter());
  });

  it('should return 200 and health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return timestamp as ISO string', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
