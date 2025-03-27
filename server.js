const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
// const productRoutes = require('./routes/productRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// app.use('/api', productRoutes);

app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
