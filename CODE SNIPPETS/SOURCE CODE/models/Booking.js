const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [16, 'You must be at least 16 years old']
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
    },
    experience: {
        type: String,
        required: [true, 'Experience details are required'],
        minlength: [20, 'Experience description should be at least 20 characters']
    },
    availability: {
        type: String,
        required: [true, 'Availability information is required']
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('Booking', BookingSchema);