const express = require('express');
const router = express.Router();

let products = [
  { id: 1, name: 'คีย์บอร์ดไร้สาย', price: 1290, stock: 25, category: 'electronics', createdAt: new Date().toISOString() },
  { id: 2, name: 'หนังสือ Node.js', price: 450, stock: 10, category: 'books', createdAt: new Date().toISOString() },
];
let nextId = 3;
const CATEGORIES = ['electronics', 'books', 'fashion'];

function validate(body, partial = false) {
  const { name, price, stock, category } = body;
  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) return 'name ต้องเป็นข้อความและไม่ว่าง';
  }
  if (!partial || price !== undefined) {
    if (typeof price !== 'number' || price < 0) return 'price ต้องเป็นตัวเลขที่ไม่ติดลบ';
  }
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) return 'stock ต้องเป็นจำนวนเต็มที่ไม่ติดลบ';
  if (category !== undefined && !CATEGORIES.includes(category)) return `category ต้องเป็น ${CATEGORIES.join(', ')}`;
  return null;
}

const findProduct = (req, res, next) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'ไม่พบสินค้า' });
  req.product = product;
  next();
};

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: รายการสินค้า
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: ค้นหาจากชื่อสินค้า
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [electronics, books, fashion] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 10 }
 *                 total: { type: integer, example: 2 }
 *   post:
 *     tags: [Products]
 *     summary: สร้างสินค้าใหม่
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 *         headers:
 *           Location:
 *             schema: { type: string }
 *             description: URL ของสินค้าที่สร้าง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/', (req, res) => {
  const { q, category } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  let result = products;
  if (q) result = result.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  if (category) result = result.filter((p) => p.category === category);
  const start = (page - 1) * limit;
  res.json({ data: result.slice(start, start + limit), page, limit, total: result.length });
});

router.post('/', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, price, stock = 0, category } = req.body;
  const product = { id: nextId++, name, price, stock, category, createdAt: new Date().toISOString() };
  products.push(product);
  res.status(201).location(`/api/products/${product.id}`).json(product);
});

/**
 * @openapi
 * /api/products/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/ProductId'
 *   get:
 *     tags: [Products]
 *     summary: ดูสินค้าตาม id
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Products]
 *     summary: แก้ไขสินค้าทั้งรายการ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [Products]
 *     summary: แก้ไขสินค้าบางฟิลด์
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name: { type: string }
 *               price: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               category: { type: string, enum: [electronics, books, fashion] }
 *             example: { price: 990, stock: 40 }
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Products]
 *     summary: ลบสินค้า
 *     responses:
 *       204:
 *         description: ลบสำเร็จ (ไม่มี body)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', findProduct, (req, res) => res.json(req.product));

router.put('/:id', findProduct, (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, price, stock = 0, category } = req.body;
  Object.assign(req.product, { name, price, stock, category });
  res.json(req.product);
});

router.patch('/:id', findProduct, (req, res) => {
  const error = validate(req.body, true);
  if (error) return res.status(400).json({ error });
  const allowed = ['name', 'price', 'stock', 'category'];
  for (const key of allowed) if (req.body[key] !== undefined) req.product[key] = req.body[key];
  res.json(req.product);
});

router.delete('/:id', findProduct, (req, res) => {
  products = products.filter((p) => p.id !== req.product.id);
  res.status(204).end();
});

module.exports = router;