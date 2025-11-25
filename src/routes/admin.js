const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Dashboard de Administração
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  res.render('admin/index', {
    title: 'Administração',
    activeMenu: 'admin'
  });
});

module.exports = router;

