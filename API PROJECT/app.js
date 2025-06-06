// Core dependencies for server setup
const express = require('express');          // Express framework for HTTP server
const mongoose = require('mongoose');        // ODM for MongoDB
const cors = require('cors');                // Middleware for enabling CORS
const path = require('path');                // Node.js path utilities

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;      // Use environment port or fallback to 8000

// Middleware setup
app.use(cors());                            // Enable CORS for all routes
app.use(express.json());                    // Parse JSON bodies
app.use(express.static('public'));          // Serve static files from /public

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fennec_fc', {
  useNewUrlParser: true,                    // Use new URL parser
  useUnifiedTopology: true,                 // Use new server discovery engine
});

// MongoDB connection events
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);                          // Exit if DB connection fails
});
db.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

// --- Mongoose Schemas ---

// Player: represents a football player
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },                    // Full name
  position: { type: String, required: true },                // Playing position
  age: { type: Number, required: true },                     // Age
  nationality: { type: String, required: true },             // Country
  jerseyNumber: { type: Number, unique: true, required: true }, // Unique jersey number
  isAvailable: { type: Boolean, default: true },             // Availability
  createdAt: { type: Date, default: Date.now }               // Creation timestamp
});

// Team: represents a football team
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },                    // Team name
  formation: { type: String, required: true },               // Formation (e.g. 4-4-2)
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Player references
  createdAt: { type: Date, default: Date.now }               // Creation timestamp
});

// Tournament: represents a football tournament
const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },                    // Tournament name
  startDate: { type: Date, required: true },                 // Start date
  endDate: { type: Date, required: true },                   // End date
  location: { type: String, required: true },                // Location
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }], // Team references
  maxTeams: { type: Number, default: 16 },                   // Max teams allowed
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }, // Status
  createdAt: { type: Date, default: Date.now }               // Creation timestamp
});

// Mongoose models
const Player = mongoose.model('Player', playerSchema);
const Team = mongoose.model('Team', teamSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);

// ===== PLAYER ROUTES =====

// Get all players, sorted by jersey number
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find().sort({ jerseyNumber: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single player by ID
app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new player
app.post('/api/players', async (req, res) => {
  try {
    const { name, position, age, nationality, jerseyNumber } = req.body;
    // Prevent duplicate jersey numbers
    const existingPlayer = await Player.findOne({ jerseyNumber });
    if (existingPlayer) {
      return res.status(400).json({ error: 'Jersey number already taken' });
    }
    const player = new Player({ name, position, age, nationality, jerseyNumber });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update player info
app.put('/api/players/:id', async (req, res) => {
  try {
    const { name, position, age, nationality, jerseyNumber, isAvailable } = req.body;
    // Check for jersey number conflicts
    if (jerseyNumber) {
      const existingPlayer = await Player.findOne({
        jerseyNumber,
        _id: { $ne: req.params.id }
      });
      if (existingPlayer) {
        return res.status(400).json({ error: 'Jersey number already taken' });
      }
    }
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { name, position, age, nationality, jerseyNumber, isAvailable },
      { new: true, runValidators: true }
    );
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a player
app.delete('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TEAM ROUTES =====

// Get all teams with player details
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single team by ID with player details
app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new team
app.post('/api/teams', async (req, res) => {
  try {
    const { name, formation, players } = req.body;
    // Validate player IDs
    if (players && players.length > 0) {
      const validPlayers = await Player.find({ _id: { $in: players } });
      if (validPlayers.length !== players.length) {
        return res.status(400).json({ error: 'One or more player IDs are invalid' });
      }
    }
    const team = new Team({ name, formation, players: players || [] });
    await team.save();
    await team.populate('players');
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update team info and roster
app.put('/api/teams/:id', async (req, res) => {
  try {
    const { name, formation, players } = req.body;
    // Validate player IDs
    if (players && players.length > 0) {
      const validPlayers = await Player.find({ _id: { $in: players } });
      if (validPlayers.length !== players.length) {
        return res.status(400).json({ error: 'One or more player IDs are invalid' });
      }
    }
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, formation, players: players || [] },
      { new: true, runValidators: true }
    ).populate('players');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a team
app.delete('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TOURNAMENT ROUTES =====

// Get all tournaments with teams and their players
app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate({
      path: 'teams',
      populate: { path: 'players' }
    });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single tournament by ID with full details
app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate({
      path: 'teams',
      populate: { path: 'players' }
    });
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new tournament
app.post('/api/tournaments', async (req, res) => {
  try {
    const { name, startDate, endDate, location, teams, maxTeams } = req.body;
    // Validate team IDs
    if (teams && teams.length > 0) {
      const validTeams = await Team.find({ _id: { $in: teams } });
      if (validTeams.length !== teams.length) {
        return res.status(400).json({ error: 'One or more team IDs are invalid' });
      }
    }
    const tournament = new Tournament({
      name,
      startDate,
      endDate,
      location,
      teams: teams || [],
      maxTeams
    });
    await tournament.save();
    await tournament.populate({
      path: 'teams',
      populate: { path: 'players' }
    });
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update tournament info and teams
app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const { name, startDate, endDate, location, teams, maxTeams, status } = req.body;
    // Validate team IDs
    if (teams && teams.length > 0) {
      const validTeams = await Team.find({ _id: { $in: teams } });
      if (validTeams.length !== teams.length) {
        return res.status(400).json({ error: 'One or more team IDs are invalid' });
      }
    }
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { name, startDate, endDate, location, teams: teams || [], maxTeams, status },
      { new: true, runValidators: true }
    ).populate({
      path: 'teams',
      populate: { path: 'players' }
    });
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a tournament
app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Fennec FC Management System is ready!');
});