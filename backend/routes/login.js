const express = require('express');
const router = express.Router();
const Family = require('../models/family');

router.post('/', async (req, res) => {
  const { email, dob } = req.body;

  try {
    if (!email || !dob) {
      return res.redirect('/login.html?error=Please%20enter%20email%20and%20DOB');
    }

    const dobDate = new Date(dob);

    const user = await Family.findOne({
      email: email.trim(),
      dob: dobDate,
      status: 'approved'
    });

    if (!user) {
      return res.redirect('/login.html?error=Login%20failed%2C%20invalid%20credentials');
    }

    // If login is successful, redirect to dashboard
    res.redirect('/dashboard.html');
  } catch (err) {
    console.error('Login error:', err);
    res.redirect('/login.html?error=Server%20error');
  }
});

module.exports = router;
