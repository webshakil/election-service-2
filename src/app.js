//one api call for all operation
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
//import electionRoutes from './routes/electionRoutes.js';
console.log('🔍 Importing election routes...');
import electionRoutes from './routes/electionRoutes.js';
console.log('✅ Election routes imported successfully');
import { electionErrorHandler, electionNotFound } from './middleware/errorHandler.js';
import { logElectionActivity } from './middleware/electionMiddleware.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
// app.use(cors({
//   origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Referrer',        // Add this
    'x-user-id'          // Add this
  ]
}));

// Compression middleware
app.use(compression());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(logElectionActivity);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Election Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
//app.use('/api/elections', electionRoutes);
console.log('🔍 Registering routes at /api/elections...');
app.use('/api/elections', electionRoutes);
console.log('✅ Routes registered at /api/elections');

// 404 handler for election routes
app.use('/api/elections/*', electionNotFound);

// Global error handler
app.use(electionErrorHandler);

// Generic 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Election Service running on port ${PORT}`);
  console.log(`📈 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import compression from 'compression';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import { connectDB } from './config/database.js';
// import routes from './routes/index.js';
// import { errorHandler } from './middleware/errorHandler.js';

// // Load environment variables
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// const PORT = process.env.PORT || 3002;

// // Security middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // limit each IP to 1000 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // CORS configuration
// // app.use(cors({
// //   origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role', 'X-User-Type'],
// // }));
// app.use(cors({
//   origin: (origin, callback) => {
//     const allowed = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
//     if (!origin || allowed.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// }));


// // Compression
// app.use(compression());

// // Logging
// app.use(morgan('combined'));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Connect to database
// await connectDB();

// // Health check route
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     service: 'Election Creation Service',
//     timestamp: new Date().toISOString(),
//     version: process.env.npm_package_version || '1.0.0'
//   });
// });

// // API routes
// app.use('/api/v1', routes);

// // Global error handler
// app.use(errorHandler);

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Route not found',
//     message: `Cannot ${req.method} ${req.originalUrl}`,
//   });
// });

// // // Graceful shutdown
// // process.on('SIGTERM', async () => {
// //   console.log('SIGTERM received, shutting down gracefully...');
// //   process.exit(0);
// // });

// // process.on('SIGINT', async () => {
// //   console.log('SIGINT received, shutting down gracefully...');
// //   process.exit(0);
// // });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Election Creation Service running on port ${PORT}`);
//   console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔗 Health check: http://localhost:${PORT}/health`);
// });

// export default app;