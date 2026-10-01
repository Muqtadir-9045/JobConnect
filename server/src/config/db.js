const mongoose = require('mongoose');

const cache = globalThis.__jobconnectMongo || (globalThis.__jobconnectMongo = { promise: null });

const connectionOptions = () => ({
  maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!cache.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    cache.promise = mongoose
      .connect(uri, connectionOptions())
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn.connection;
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  return cache.promise;
};

module.exports = connectDB;
