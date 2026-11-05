import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Department from '../models/Department.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'urbanpulse_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (citizen by default, or authority/admin)
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, departmentCode, phone, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let departmentId = null;
    if (role === 'authority' && departmentCode) {
      const dept = await Department.findOne({ code: departmentCode.toUpperCase() });
      if (dept) {
        departmentId = dept._id;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen',
      department: departmentId,
      phone: phone || '',
      address: address || '',
      civicPoints: 15,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        civicPoints: user.civicPoints,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('department');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        civicPoints: user.civicPoints,
        badges: user.badges,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.phone = phone !== undefined ? phone : user.phone;
      user.address = address !== undefined ? address : user.address;
      user.avatar = avatar !== undefined ? avatar : user.avatar;
      const updatedUser = await user.save();

      res.json({
        success: true,
        user: updatedUser,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};
