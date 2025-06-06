// This file is for documentation purposes only, showing the database schema design

/**
 * Fennec FC Trial Booking Database Schema
 * 
 * Collection: bookings
 * 
 * Schema:
 * {
 *   name: {
 *     type: String,
 *     required: true,
 *     description: "Applicant's full name (first and last name)"
 *   },
 *   email: {
 *     type: String,
 *     required: true,
 *     unique: true,
 *     description: "Contact email address for communications"
 *   },
 *   age: {
 *     type: Number,
 *     required: true,
 *     min: 16,
 *     description: "Applicant's age (minimum 16 years)"
 *   },
 *   position: {
 *     type: String,
 *     required: true,
 *     enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
 *     description: "Preferred playing position"
 *   },
 *   experience: {
 *     type: String,
 *     required: true,
 *     minlength: 20,
 *     description: "Previous football experience description"
 *   },
 *   availability: {
 *     type: String,
 *     required: true,
 *     description: "Availability for trial sessions"
 *   },
 *   submissionDate: {
 *     type: Date,
 *     default: Date.now,
 *     description: "Date and time when application was submitted"
 *   },
 *   status: {
 *     type: String,
 *     enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
 *     default: 'Pending',
 *     description: "Current status of application"
 *   }
 * }
 * 
 * Indexes:
 * - email: For quick lookups by email address
 * - status: For filtering applications by status
 * - submissionDate: For chronological sorting
 * 
 * Relationships:
 * This is a standalone collection but could be extended with relationships to:
 * - User accounts (if implementing authentication)
 * - Trial sessions (for scheduling)
 * - Teams (for assigning successful applicants)
 */

/**
 * Database Diagram (ASCII representation):
 * 
 * +-----------------------+
 * |      bookings         |
 * +-----------------------+
 * | _id: ObjectId         |
 * | name: String          |
 * | email: String         |
 * | age: Number           |
 * | position: String      |
 * | experience: String    |
 * | availability: String  |
 * | submissionDate: Date  |
 * | status: String        |
 * +-----------------------+
 */