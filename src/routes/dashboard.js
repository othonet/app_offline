const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Dashboard principal
router.get('/dashboard', authenticateToken, (req, res) => {
  res.render('dashboard/index', {
    title: 'Dashboard',
    user: req.user,
    activeMenu: 'dashboard'
  });
});

// Redireciona raiz para dashboard
router.get('/', authenticateToken, (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router;

