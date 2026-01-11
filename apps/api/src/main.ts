import express from 'express';
import { tenantContext } from './middleware/tenant-context';
import projectRoutes from './routes/projects';
import productRoutes from './routes/products';
import scriptRoutes from './routes/scripts';
import scriptStepRoutes from './routes/script-steps';

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

// Health check endpoint (no auth required)
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Protected routes with tenant context
app.use('/api/projects', tenantContext, projectRoutes);
app.use('/api', tenantContext, productRoutes);
app.use('/api', tenantContext, scriptRoutes);
app.use('/api', tenantContext, scriptStepRoutes);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
