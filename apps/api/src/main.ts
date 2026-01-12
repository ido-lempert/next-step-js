import express from 'express';
import { tenantContext } from './middleware/tenant-context';
import projectRoutes from './routes/projects';
import productRoutes from './routes/products';
import scriptRoutes from './routes/scripts';
import scriptStepRoutes from './routes/script-steps';
import aiGenerationRoutes from './routes/ai-generation';
import publicRoutes from './routes/public';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();

// Middleware
app.use(express.json());

// CORS configuration for Angular app and SDK
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Tenant-Id, X-API-Key');
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

// Public routes (no authentication required)
app.use('/api/public', publicRoutes);

// Protected routes with tenant context
app.use('/api/projects', tenantContext, projectRoutes);
app.use('/api', tenantContext, productRoutes);
app.use('/api', tenantContext, scriptRoutes);
app.use('/api', tenantContext, scriptStepRoutes);
app.use('/api', tenantContext, aiGenerationRoutes);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
