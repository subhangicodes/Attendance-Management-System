const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { config } = require('../config/db')

// Helper to validate company domain in employeeId
function validateCompany(employeeId){
	if (!employeeId || typeof employeeId !== 'string') return false
	return employeeId.toLowerCase().includes('@sanshell')
}

// POST /api/auth/login
// Accepts { employeeId, password }
exports.login = async (req, res) => {
	try {
		const { employeeId, password } = req.body
		if (!employeeId || !password) return res.status(400).json({ message: 'employeeId and password required' })

		if (!validateCompany(employeeId)) return res.status(400).json({ message: 'employeeId must include @sanshell' })

		const user = await User.findOne({ employeeId })
		if (!user) return res.status(404).json({ message: 'User not found. Please register first.' })


		 const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
		// verify password
		const ok = await bcrypt.compare(password, user.passwordHash)
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

		// create a token
		const token = jwt.sign({ 
			id: user._id, 
			role: user.role, 
			employeeId: user.employeeId 
		}, config.JWT_SECRET, { expiresIn: '1d' })

		res.json({ 
			user: { 
				id: user._id, 
				employeeId: user.employeeId, 
				name: user.name, 
				role: user.role 
			}, token 
		})
	} catch (err) {
		console.error('auth error', err)
		res.status(500).json({ message: 'Server error' })
	}
}

// POST /api/auth/register
// Accepts { employeeId, password, name }
exports.register = async (req, res) => {
	try {
		const { employeeId, password, name } = req.body
		if (!employeeId || !password) return res.status(400).json({ message: 'employeeId and password required' })

		if (!validateCompany(employeeId)) return res.status(400).json({ message: 'employeeId must include @sanshell' })

		const existing = await User.findOne({ employeeId })
		if (existing) return res.status(409).json({ message: 'User already exists. Please login.' })

		const hash = await bcrypt.hash(password, 10)
		const user = new User({ 
			employeeId, 
			name: name || employeeId, 
			passwordHash: hash ,
			role: 'employee',
		})
		await user.save()

		// create a token and return
		const token = jwt.sign({ id: user._id, role: user.role, employeeId: user.employeeId }, config.JWT_SECRET, { expiresIn: '7d' })
		res.status(201).json({ 
			user: { 
				id: user._id, 
				employeeId: user.employeeId, 
				name: user.name, 
				role: user.role 
			}
				, token 
			})
	} catch (err) {
		console.error('register error', err)
		res.status(500).json({ message: 'Server error' })
	}
}

