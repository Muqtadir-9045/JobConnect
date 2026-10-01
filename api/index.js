const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');
const { getSecret } = require('../server/src/utils/token');

app.set('trust proxy', 1);

module.exports = async (req, res) => {
  try {
    getSecret();
    await connectDB();
  } catch (err) {
    console.error(`API unavailable: ${err.message}`);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, message: 'Service temporarily unavailable, please try again shortly' }));
    return;
  }
  return app(req, res);
};
