const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Test sample for the Booking model
describe('Booking Model Tests', () => {
  // Connect to the test database before tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fennec_fc_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Clear all test data after each test
  afterEach(async () => {
    await Booking.deleteMany({});
  });

  // Disconnect from test database after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test case for creating a valid booking
  it('should save a valid booking', async () => {
    const validBooking = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 18,
      position: 'Midfielder',
      experience: 'I have played for my school team for 3 years and participated in regional tournaments.',
      availability: 'Weekends and Wednesday evenings'
    };

    const savedBooking = await new Booking(validBooking).save();
    
    // Check all fields were saved correctly
    expect(savedBooking.name).toBe(validBooking.name);
    expect(savedBooking.email).toBe(validBooking.email);
    expect(savedBooking.age).toBe(validBooking.age);
    expect(savedBooking.position).toBe(validBooking.position);
    expect(savedBooking.experience).toBe(validBooking.experience);
    expect(savedBooking.availability).toBe(validBooking.availability);
    
    // Default values are set correctly
    expect(savedBooking.status).toBe('Pending');
    expect(savedBooking.submissionDate).toBeDefined();
  });

  // Test case for validation errors
  it('should not save a booking with missing required fields', async () => {
    const invalidBooking = {
      name: 'John', // Missing last name
      email: 'not-an-email', // Invalid email format
      age: 14, // Below minimum age
      position: 'Striker', // Not in enum values
      experience: 'brief', // Too short
      availability: '' // Empty required field
    };

    try {
      await new Booking(invalidBooking).save();
      // If it reaches here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Validation error should be thrown
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      
      // Check specific validation errors
      expect(error.errors.email).toBeDefined();
      expect(error.errors.age).toBeDefined();
      expect(error.errors.position).toBeDefined();
      expect(error.errors.experience).toBeDefined();
      expect(error.errors.availability).toBeDefined();
    }
  });

  // Test case for finding bookings
  it('should find bookings by status', async () => {
    // Create test bookings
    await Booking.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        age: 18,
        position: 'Goalkeeper',
        experience: 'Played for 5 years at school level competitions.',
        availability: 'Weekends',
        status: 'Pending'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 21,
        position: 'Forward',
        experience: 'Played for university team for 3 years, scored 15 goals last season.',
        availability: 'Evenings',
        status: 'Approved'
      }
    ]);

    // Find all pending bookings
    const pendingBookings = await Booking.find({ status: 'Pending' });
    expect(pendingBookings.length).toBe(1);
    expect(pendingBookings[0].name).toBe('John Doe');

    // Find all approved bookings
    const approvedBookings = await Booking.find({ status: 'Approved' });
    expect(approvedBookings.length).toBe(1);
    expect(approvedBookings[0].name).toBe('Jane Smith');
  });
});