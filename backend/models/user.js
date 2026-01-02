const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'employee', enum: ['employee','admin'] },
}, { timestamps: true })


module.exports = mongoose.model('User', userSchema)
