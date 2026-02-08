const { body, validationResult } = require('express-validator');

const validationRules = {
  signup: [
    body('name')
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be between 20 and 60 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
    body('address')
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters')
  ],

  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  addUser: [
    body('name')
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be between 20 and 60 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
    body('address')
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters'),
    body('role')
      .isIn(['admin', 'user', 'owner'])
      .withMessage('Role must be admin, user, or owner')
  ],

  addStore: [
    body('name')
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage('Store name must be between 20 and 60 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('address')
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address must not exceed 400 characters')
  ],

  updatePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 16 })
      .withMessage('New password must be between 8 and 16 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character')
  ],

  submitRating: [
    body('storeId')
      .isInt({ min: 1 })
      .withMessage('Valid store ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5')
  ]
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = { validationRules, validate };
