const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Products CRUD API',
      version: '1.0.0',
      description: 'ตัวอย่าง CRUD API พร้อมเอกสารด้วย Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
    ],
    tags: [
      {
        name: 'Products',
        description: 'จัดการสินค้า',
      },
    ],
    paths: {
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'รายการสินค้า',
          parameters: [
            { in: 'query', name: 'q', schema: { type: 'string' }, description: 'ค้นหาจากชื่อสินค้า' },
            { in: 'query', name: 'category', schema: { type: 'string', enum: ['electronics', 'books', 'fashion'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            '200': {
              description: 'สำเร็จ',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 2 },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'สร้างสินค้าใหม่',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductInput' },
              },
            },
          },
          responses: {
            '201': {
              description: 'สร้างสำเร็จ',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/products/{id}': {
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'รหัสสินค้า',
          },
        ],
        get: {
          tags: ['Products'],
          summary: 'ดูสินค้าตาม id',
          responses: {
            '200': {
              description: 'สำเร็จ',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'แก้ไขสินค้าทั้งรายการ',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductInput' },
              },
            },
          },
          responses: {
            '200': {
              description: 'แก้ไขสำเร็จ',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
        patch: {
          tags: ['Products'],
          summary: 'แก้ไขสินค้าบางฟิลด์',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'number' },
                    stock: { type: 'integer' },
                    category: { type: 'string' },
                  },
                  example: { price: 990, stock: 40 },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'แก้ไขสำเร็จ',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'ลบสินค้า',
          responses: {
            '204': { description: 'ลบสำเร็จ (ไม่มี body)' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
    },
    components: {
      schemas: {
        ProductInput: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: { type: 'string', example: 'เมาส์ไร้สาย' },
            price: { type: 'number', example: 590 },
            stock: { type: 'integer', example: 15 },
            category: { type: 'string', example: 'electronics' },
          },
        },
        Product: {
          allOf: [
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
            { $ref: '#/components/schemas/ProductInput' },
          ],
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string', example: 'ไม่พบสินค้า' } },
        },
      },
      responses: {
        NotFound: {
          description: 'ไม่พบสินค้า',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        BadRequest: {
          description: 'ข้อมูลไม่ถูกต้อง',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);