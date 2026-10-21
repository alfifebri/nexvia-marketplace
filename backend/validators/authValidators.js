import { body } from 'express-validator';

const passwordRule = (field = 'password') =>
  body(field)
    .isString()
    .withMessage('Password must be a string.')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters.')
    .matches(/[a-z]/)
    .withMessage('Password must include at least one lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter.')
    .matches(/\d/)
    .withMessage('Password must include at least one number.');

export const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .isLength({ max: 254 })
    .withMessage('Email is too long.'),
  passwordRule('password'),
  body('role')
    .optional()
    .isIn(['customer', 'vendor'])
    .withMessage('Role must be either customer or vendor.'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[+]?[\d\s()-]{7,20}$/)
    .withMessage('Please provide a valid phone number.'),
  body('storeName')
    .if((_value, { req }) => req.body.role === 'vendor')
    .trim()
    .notEmpty()
    .withMessage('Store name is required for vendor accounts.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters.'),
];

export const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.'),
  body('password').isString().withMessage('Password is required.').notEmpty().withMessage('Password is required.'),
];

export const updatePasswordValidators = [
  body('currentPassword').isString().withMessage('Current password is required.').notEmpty().withMessage('Current password is required.'),
  passwordRule('newPassword'),
];
