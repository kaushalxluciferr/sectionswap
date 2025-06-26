import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  Alert
} from '@mui/material';
import axios from 'axios';

const HomePage = () => {
  const [formData, setFormData] = useState({
    currentSection: '',
    desiredSection: '',
    whatsappNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.currentSection || !formData.desiredSection || !formData.whatsappNumber) {
      setError('All fields are required');
      return;
    }
    
    try {
      await axios.post('https://sectionswap-backend.vercel.app/api/swap-requests', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/matches', { 
          state: { 
            currentSection: formData.currentSection,
            desiredSection: formData.desiredSection,
            whatsappNumber: formData.whatsappNumber
          } 
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Section Swap Request
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Enter your current section, desired section, and WhatsApp number to find potential swaps.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Request submitted successfully!</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Current Section"
                name="currentSection"
                value={formData.currentSection}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Desired Section"
                name="desiredSection"
                value={formData.desiredSection}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="WhatsApp Number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
            >
              Submit Request
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;