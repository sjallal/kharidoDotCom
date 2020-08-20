const express = require('express');
const app = express();
const connectDB = require('./config/db');
connectDB();
app.use(express.json({ extented: false }));

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('API running...');
});

//My routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/category', require('./routes/api/category'));
// app.use('/api/product', require('./routes/api/product'));
app.use('/api/user', require('./routes/api/user'));

//Starting a server
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});
