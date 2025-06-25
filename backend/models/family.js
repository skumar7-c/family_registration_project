const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  profileImage: String,
  familyHead: String,
  gender: String,
  dob: Date,
  phone: String,
  email: String,
  locality: String,
  occupation: String,
  gotra: String,
  nativePlace: String,
  bloodGroup: String,
  address: String,
  members: [
    {
      name: String,
      relation: String,
      age: Number,
      maritalStatus: String,
      bloodGroup: String,
      qualification: String,
      occupation: String
    }
  ]
});

module.exports = mongoose.model('Family', familySchema);
 
