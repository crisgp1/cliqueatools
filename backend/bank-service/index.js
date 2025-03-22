// bank-service microservice entry point

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'bank-service', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`bank-service microservice running on port ${PORT}`);
});
