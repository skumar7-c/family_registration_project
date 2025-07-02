const express = require('express');
const router = express.Router();
const Family = require('../models/family');
const sendEmail = require('../utils/sendEmail');

// ✅ Admin credentials
const ADMIN_EMAIL = "satyendrakumar25588@gmail.com";
const ADMIN_PASSWORD = "Sat@#123";

// ✅ Middleware to check if admin is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.adminLoggedIn) {
    return next();
  }
  return res.status(403).send('Access denied. Please login as admin.');
}

// ✅ Admin login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.adminLoggedIn = true;
    return res.json({ success: true });
  }

  return res.json({ success: false, message: 'Invalid credentials' });
});

// ✅ Admin logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin-login.html'); // Change to appropriate logout redirect page
});

// ✅ Admin dashboard page (protected)
router.get('/', isAuthenticated, (req, res) => {
  res.render('admin'); // Ensure views/admin.ejs exists
});

// ✅ Fetch all family submissions (protected)
router.get('/families', isAuthenticated, async (req, res) => {
  try {
    const families = await Family.find().sort({ createdAt: -1 });
    res.json(families);
  } catch (error) {
    console.error("❌ Error fetching families:", error);
    res.status(500).json({ error: 'Failed to fetch families' });
  }
});

// ✅ Approve/Reject a family (protected)
router.post('/families/:id/:status', isAuthenticated, async (req, res) => {
  const { id, status } = req.params;

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const family = await Family.findById(id);
    if (!family) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the status
    family.status = status;
    await family.save();

    // Send email if email is available
    if (family.email) {
      const subject = `Registration ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`;
      const loginLink = process.env.LOGIN_LINK || 'https://family-registration-project-12.onrender.com/login';

      const message =
        status === 'approved'
          ? `Hi ${family.familyHead},\n\nYour registration has been approved! 🎉\n\nLogin here: ${loginLink}\nYour username is your email address, and your password is your Date of Birth (DOB).`
          : `Hi ${family.familyHead},\n\nWe regret to inform you that your registration has been rejected.\n\nThank you for your interest.`;

      await sendEmail(family.email, subject, message);
      console.log(`📧 Email sent to ${family.email}`);
    }

    res.send(`✅ User status updated to '${status}' and email sent.`);
  } catch (err) {
    console.error("❌ Error updating status or sending email:", err.message);
    res.status(500).json({ error: 'Failed to update status or send email' });
  }
});

module.exports = router;
