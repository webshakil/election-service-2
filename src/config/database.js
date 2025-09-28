// config/database.js
import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vottery_election-2',
  username: process.env.DB_USER || 'vottery_user',
  password: process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // allow self-signed certs
    }
  }
};

const sequelize = new Sequelize(dbConfig);

// Add PostgreSQL Pool for raw queries (Option 2)
export const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vottery_election-2',
  user: process.env.DB_USER || 'vottery_user',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    require: true,
    rejectUnauthorized: false // allow self-signed certs
  }
});

// Test connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Test pgPool connection too
    const client = await pgPool.connect();
    console.log('✅ PostgreSQL Pool connection established');
    client.release();
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

export default sequelize;
// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'vottery_election-2',
//   username: process.env.DB_USER || 'vottery_user',
//   password: process.env.DB_PASSWORD || '',
//   dialect: 'postgres',
//   logging: process.env.NODE_ENV === 'development' ? console.log : false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   },
//   define: {
//     timestamps: true,
//     underscored: true,
//     freezeTableName: true
//   },
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false // allow self-signed certs
//     }
//   }
// };

// const sequelize = new Sequelize(dbConfig);

// // Test connection
// export const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ Database connection established successfully');
    
//     if (process.env.NODE_ENV === 'development') {
//       await sequelize.sync({ alter: true });
//       console.log('✅ Database models synchronized');
//     }

//     return sequelize;
//   } catch (error) {
//     console.error('❌ Unable to connect to database:', error);
//     throw error;
//   }
// };

// export default sequelize;

// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// // Database configuration
// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'vottery_election-2',
//   username: process.env.DB_USER || 'vottery_user',
//   password: process.env.DB_PASSWORD || '',
//   dialect: 'postgres',
//   logging: process.env.NODE_ENV === 'development' ? console.log : false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   },
//   define: {
//     timestamps: true,
//     underscored: true,
//     freezeTableName: true
//   },
//   dialectOptions: {
//     ssl: process.env.NODE_ENV === 'production' ? {
//       require: true,
//       rejectUnauthorized: false
//     } : false
//   }
// };

// // Create Sequelize instance
// const sequelize = new Sequelize(dbConfig);

// // Test database connection
// export const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ Database connection established successfully');
    
//     // Sync models in development
//     if (process.env.NODE_ENV === 'development') {
//       await sequelize.sync({ alter: true });
//       console.log('✅ Database models synchronized');
//     }
    
//     return sequelize;
//   } catch (error) {
//     console.error('❌ Unable to connect to database:', error);
//     throw error;
//   }
// };

// export default sequelize;