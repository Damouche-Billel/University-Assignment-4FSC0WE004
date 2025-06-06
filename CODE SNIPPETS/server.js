// Configured for MongoDB and Nodemailer
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import Booking model
const Booking = require('./models/Booking');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Make sure MongoDB is running and the connection string is correct');
});

// Set flag to skip email sending (keep this to avoid email errors)
const SKIP_EMAIL = true;

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a mock transporter that just logs emails
const mockTransporter = {
  sendMail: (mailOptions) => {
    console.log('Email would be sent in production:');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Content: Email confirmation with booking details');
    return Promise.resolve({ response: 'Development mode - email not sent' });
  }
};

// Configure transporter (using mock details)
const transporter = SKIP_EMAIL ? mockTransporter : nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// API route to get all bookings (for demonstration purposes)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ submissionDate: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).json({ success: false, message: 'Error retrieving bookings' });
    }
});

// Validation middleware for the booking form
const bookingValidation = [
    check('name').trim().notEmpty().withMessage('Please enter your full name')
        .matches(/^(\w+\s+\w+)/).withMessage('Please enter your first and last name'),
    check('email').trim().notEmpty().withMessage('Please enter your email address')
        .isEmail().withMessage('Please enter a valid email address'),
    check('age').trim().notEmpty().withMessage('Please enter your age')
        .isInt({ min: 16 }).withMessage('You must be at least 16 years old'),
    check('position').trim().notEmpty().withMessage('Please select your preferred position'),
    check('experience').trim().notEmpty().withMessage('Please enter your previous experience')
        .isLength({ min: 20 }).withMessage('Please provide more details about your experience'),
    check('availability').trim().notEmpty().withMessage('Please provide your availability for the trial')
];

// Handle form submission
app.post('/submit-trial', bookingValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Create new booking using the Mongoose model
        const newBooking = new Booking({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            position: req.body.position,
            experience: req.body.experience,
            availability: req.body.availability,
            submissionDate: new Date()
        });

        // Save to MongoDB
        await newBooking.save();
        console.log('Booking saved to MongoDB successfully');

        // Prepare email content
        const mailOptions = {
            from: process.env.EMAIL_USER || 'development@example.com',
            to: req.body.email,
            subject: 'Fennec FC Trial Booking Confirmation',
            html: `
                <h2>Thank you for booking a trial with Fennec FC!</h2>
                <p>We have received your application and will be in touch soon to confirm your trial date.</p>
                <h3>Your Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ${req.body.name}</li>
                    <li><strong>Age:</strong> ${req.body.age}</li>
                    <li><strong>Position:</strong> ${req.body.position}</li>
                    <li><strong>Availability:</strong> ${req.body.availability}</li>
                </ul>
                <p>If you need to make any changes to your booking, please contact us at trials@fennecfc.com</p>
                <p>We look forward to seeing you at the trial!</p>
                <p>Fennec FC Team</p>
            `
        };

        // Send or log email
        await transporter.sendMail(mailOptions);

        // Send success response
        res.status(200).json({ 
            success: true, 
            message: 'Thank you for your submission! We will contact you soon about your trial.'
        });
    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while processing your booking. Please try again later.' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to view the application`);
});

module.exports = app; // For testing purposes