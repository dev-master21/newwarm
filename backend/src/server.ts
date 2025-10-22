// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/config';
import routes from './routes';
import db from './config/database';

const app = express();

// CORS настройки - разрешаем несколько origin'ов
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://warm.novaestate.company',
  'http://warm.novaestate.company',
  config.frontendUrl
];

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, от Postman или мобильных приложений)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Временно разрешаем все для разработки
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 минут
}));

// Безопасность
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Логирование
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Парсинг JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Статические файлы (для загрузок)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API роуты
app.use(config.apiPrefix, routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: 'connected'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack })
  });
});

// Запуск сервера
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 WARM+ Backend Server Started   ║
╠══════════════════════════════════════╣
║  Environment: ${config.env.padEnd(23)}║
║  Port:        ${PORT.toString().padEnd(23)}║
║  API:         ${config.apiPrefix.padEnd(23)}║
║  Frontend:    ${config.frontendUrl.padEnd(23)}║
╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await db.close();
  process.exit(0);
});

export default app;