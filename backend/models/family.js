const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number },
  maritalStatus: { type: String },
  bloodGroup: { type: String },
  qualification: { type: String },
  occupation: { type: String }
});

const familySchema = new mongoose.Schema({
  profileImage: { type: String }, // path or filename
  familyHead: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date },
  phone: { type: String },
  email: { type: String, required: true },
  locality: [{ type: String }],
  occupation: [{ type: String }],
  gotra: [{ type: String }],
  nativePlace: [{ type: String }],
  bloodGroup: [{ type: String }],
  address: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  members: [memberSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Family', familySchema);
