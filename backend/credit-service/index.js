// credit-service microservice entry point

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'credit-service', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`credit-service microservice running on port ${PORT}`);
});
