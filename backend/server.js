require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define Section Swap Schema
const sectionSwapSchema = new mongoose.Schema({
  currentSection: { type: String, required: true },
  desiredSection: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SectionSwap = mongoose.model('SectionSwap', sectionSwapSchema);

// Routes
app.post('/api/swap-requests', async (req, res) => {
  try {
    const { currentSection, desiredSection, whatsappNumber } = req.body;
    
    const newRequest = new SectionSwap({
      currentSection,
      desiredSection,
      whatsappNumber
    });
    
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/swap-requests', async (req, res) => {
  try {
    const requests = await SectionSwap.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/find-matches/:currentSection/:desiredSection', async (req, res) => {
  try {
    const { currentSection, desiredSection } = req.params;
    
    // Find direct matches (person who has what we want and wants what we have)
    const directMatches = await SectionSwap.find({
      currentSection: desiredSection,
      desiredSection: currentSection
    });
    
    if (directMatches.length > 0) {
      return res.json({ matchType: 'direct', matches: directMatches });
    }
    
    // Find three-way matches
    // Step 1: Find people who want our current section
    const potentialFirstLinks = await SectionSwap.find({
      desiredSection: currentSection
    });
    
    // For each potential first link, see if we can complete the triangle
    const threeWayMatches = [];
    
    for (const firstLink of potentialFirstLinks) {
      // Find someone who wants what the first link has and has what we want
      const secondLink = await SectionSwap.findOne({
        currentSection: desiredSection,
        desiredSection: firstLink.currentSection
      });
      
      if (secondLink) {
        threeWayMatches.push({
          person1: { 
            currentSection, 
            desiredSection, 
            whatsappNumber: req.query.whatsappNumber || 'Your number' 
          },
          person2: firstLink,
          person3: secondLink
        });
      }
    }
    
    if (threeWayMatches.length > 0) {
      return res.json({ matchType: 'three-way', matches: threeWayMatches });
    }
    
    res.json({ matchType: 'none', matches: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});