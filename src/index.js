const express = require('express');
const app = express();

// Basic health endpoint for monitoring and CI smoke tests
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Example API placeholder (extend later with real features)
app.get('/api/community', (req, res) => res.json({ items: [] }));

const port = process.env.PORT || 3000;

// Only start the server if run directly (not when required by tests)
if (require.main === module) {
  app.listen(port, () => console.log(`Find Community API listening on :${port}`));
}

module.exports = app;