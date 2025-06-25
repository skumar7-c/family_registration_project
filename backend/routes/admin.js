const express = require('express');
const router = express.Router();
const Family = require('../models/family');
const sendEmail = require('../utils/sendEmail'); // utils/sendEmail.js must exist

// ✅ 1. Admin Panel (Renders admin.ejs)
router.get('/', (req, res) => {
  res.render('admin'); // Ensure 'admin.ejs' exists in 'views' folder
});

// ✅ 2. Get All Families (For Display in Admin Panel)
router.get('/families', async (req, res) => {
  try {
    const families = await Family.find().sort({ createdAt: -1 });
    res.json(families);
  } catch (error) {
    console.error("❌ Error fetching families:", error);
    res.status(500).json({ error: 'Failed to fetch families' });
  }
});

// ✅ 3. Approve/Reject + Send Email Notification
router.post('/families/:id/:status', async (req, res) => {
  const { id, status } = req.params;

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const family = await Family.findById(id);
    if (!family) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update status
    family.status = status;
    await family.save();

    // Send email if email exists
    if (family.email) {
      const subject = `Registration ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`;
      const loginLink = process.env.LOGIN_LINK || 'http://localhost:5000/login';

      const message =
        status === 'approved'
          ? `Hi ${family.familyHead},\nYour registration has been approved! 🎉\nYour username is your email address and password is your date of birth.\n\nLogin here:\n${loginLink}`
          :` Hi ${family.familyHead},\n\nWe regret to inform you that your registration has been rejected.\n\nThank you for your interest.`;

      await sendEmail(family.email, subject, message);
      console.log(📧 Email sent to `${family.email}`);
    }

    res.send(✅ User status updated to '${status}' and email sent.);
  } catch (err) {
    console.error("❌ Error updating status or sending email:", err.message);
    res.status(500).json({ error: 'Failed to update status or send email' });
  }
});

module.exports = router;
