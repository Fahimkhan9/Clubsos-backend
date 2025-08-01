import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './error.middleware.js';

export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        throw new AppError('Validation failed', 400, extractedErrors);
    };
};

// Common validation chains
export const commonValidations = {
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],
    
    objectId: (field) => 
        param(field)
            .isMongoId()
            .withMessage(`Invalid ${field} ID format`),

    email: 
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),

    password: 
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'),

    name:
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]*$/)
            .withMessage('Name can only contain letters and spaces'),

    price:
        body('price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),

    url:
        body('url')
            .isURL()
            .withMessage('Please provide a valid URL')
};

// User validation chains
export const validateSignup = validate([
    commonValidations.name,
    commonValidations.email,
    commonValidations.password
]);

export const validateSignin = validate([
    commonValidations.email,
    body('password')
        .notEmpty()
        .withMessage('Password is required')
]);

export const validatePasswordChange = validate([
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character')
]);

// Club-specific validations
export const validateClubCreate = validate([
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Club name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Club name must be between 2 and 100 characters"),

    body("university")
        .trim()
        .notEmpty()
        .withMessage("University is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("University must be between 2 and 100 characters"),

    body("sessionYear")
        .trim()
        .notEmpty()
        .withMessage("Session year is required")
]);

export const validateClubUpdate = validate([
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Club name must be between 2 and 100 characters"),

    body("university")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("University must be between 2 and 100 characters"),

    body("sessionYear")
        .optional()
        .trim()
        .matches(/^\d{4}-\d{4}$/)
        .withMessage("Session year must be in format YYYY-YYYY")
]);

export const validateMemberInvite = validate([
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'moderator', 'member'])
    .withMessage('Role must be one of admin, moderator, or member'),

  body('designation')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Designation must be 2 to 50 characters long')
]);

export const validateMemberUpdate = validate([
  body('userId')
    .isMongoId()
    .withMessage('Valid userId is required'),

  body('role')
    .optional()
    .isIn(['admin', 'moderator', 'member'])
    .withMessage('Role must be one of admin, moderator, or member'),

  body('designation')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Designation must be 2 to 50 characters long')
]);
