import express from 'express';
import { tenantMiddleware } from './middleware/tenant';
import { projectRouter } from './routes/projects';
import { productRouter } from './routes/products';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();

// Middleware
app.use(express.json());

// CORS configuration for Angular app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Tenant-Id');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// API routes with tenant middleware
app.use('/api/projects', tenantMiddleware, projectRouter);
app.use('/api', tenantMiddleware, productRouter);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
