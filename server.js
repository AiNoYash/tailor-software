const dotenv = require('dotenv');
dotenv.config({ override: true }); // ? Give more priority to .env variables rather than those who exists by default

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const initSchema = require('./config/initSchema');

const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const workRoutes = require('./routes/workRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/work', workRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/orders', orderRoutes);

// Basic health check route
app.get('/lol', (req, res) => {
    res.status(200).json({ message: 'API is running cleanly' });
});


const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await initSchema();
        console.log('Database initialized successfully.');
    } catch (error) {
        // DB unavailable (e.g. remote server unreachable) — log but keep going.
        // Individual API routes will return 503 until the DB is reachable.
        console.error('DB init warning (server will still start):', error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();