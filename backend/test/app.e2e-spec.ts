import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/v1/products', () => {
    it('GET /v1/products - should return array of products', () => {
      return request(app.getHttpServer())
        .get('/v1/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /v1/products - should accept limit and offset query params', () => {
      return request(app.getHttpServer())
        .get('/v1/products?limit=5&offset=0')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /v1/products - should reject invalid payload', () => {
      return request(app.getHttpServer())
        .post('/v1/products')
        .send({ invalid: 'data' })
        .expect(400); // Validation error
    });

    it('POST /v1/products - should require numeric price and mrp', () => {
      return request(app.getHttpServer())
        .post('/v1/products')
        .send({
          sku: 'TEST-E2E',
          category: 'Medicines',
          price: 'not-a-number', // Invalid
          mrp: 100,
          stock: 10,
        })
        .expect(400);
    });
  });
});
