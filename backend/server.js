// ✅ server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Family = require('./models/family');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const session = require('express-session');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

// Static & view engine
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Admin routes
app.use('/admin', adminRoutes);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/')),
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + unique);
  }
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Home route
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Registration route
app.post('/submit-form', upload.single('profileImage'), async (req, res) => {
  try {
    const {
      familyHead, gender, dob, phone, email, city, locality,
      occupation, gotra, nativePlace, bloodGroup,
      address, memberName, memberRelation, memberAge,
      memberMaritalStatus, memberQualification, memberBloodGroup, memberOccupation
    } = req.body;

    if (!['jaipur', 'chittorgarh'].includes(city?.toLowerCase())) {
      return res.status(400).json({ message: 'City must be Jaipur or Chittorgarh' });
    }

    if (!dob || !email || !familyHead) {
      return res.status(400).send("Missing required fields: dob, email, or familyHead.");
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).send("Invalid Date format");
    }

    const members = [];
    if (Array.isArray(memberName)) {
      memberName.forEach((_, i) => {
        members.push({
          name: memberName[i],
          relation: memberRelation[i],
          age: parseInt(memberAge[i]),
          maritalStatus: memberMaritalStatus[i],
          bloodGroup: memberBloodGroup[i],
          qualification: memberQualification[i],
          occupation: memberOccupation[i]
        });
      });
    } else if (memberName) {
      members.push({
        name: memberName,
        relation: memberRelation,
        age: parseInt(memberAge),
        maritalStatus: memberMaritalStatus,
        bloodGroup: memberBloodGroup,
        qualification: memberQualification,
        occupation: memberOccupation
      });
    }

    const newFamily = new Family({
      profileImage: req.file?.path || '',
      familyHead,
      gender,
      dob: dobDate,
      phone,
      email,
      locality,
      city,
      occupation,
      gotra,
      nativePlace,
      bloodGroup,
      address,
      members,
      status: 'pending'
    });

    await newFamily.save();
    res.json({ message: '✅ Registered! Please wait for admin approval.' });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: 'Error: ' + error.message });
  }
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

// Login logic
app.post('/login', async (req, res) => {
  const { email, dob } = req.body;

  if (!email || !dob) {
    return res.render('login', { error: 'Email and DOB are required' });
  }

  try {
    const user = await Family.findOne({ email, status: 'approved' });
    if (!user) return res.render('login', { error: 'User not found or not approved' });

    const dobInput = new Date(dob).toISOString().split('T')[0];
    const dobStored = new Date(user.dob).toISOString().split('T')[0];

    if (dobInput !== dobStored) {
      return res.render('login', { error: 'Incorrect Date of Birth' });
    }

    req.session.user = { id: user._id, email: user.email, name: user.familyHead };
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { user: req.session.user });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Admin login form
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
