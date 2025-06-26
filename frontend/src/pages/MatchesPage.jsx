import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const MatchesPage = () => {
  const location = useLocation();
  const { currentSection, desiredSection, whatsappNumber } = location.state || {};
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (!currentSection || !desiredSection) {
          setError('Missing section information');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `https://sectionswap-backend.vercel.app/api/find-matches/${currentSection}/${desiredSection}`,
          { params: { whatsappNumber } }
        );
        
        setMatches(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentSection, desiredSection, whatsappNumber]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">Loading matches...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
         Swap Matches
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          You have section <Chip label={currentSection} color="primary" /> and want section <Chip label={desiredSection} color="secondary" />.
        </Typography>
      </Box>
      
      {matches?.matchType === 'direct' && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="success.main">
            Direct Match Found!
          </Typography>
          <Typography variant="body1" paragraph>
            We found someone who has your desired section and wants your current section.
          </Typography>
          
          <List>
            {matches.matches.map((match, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`Has section ${match.currentSection} and wants section ${match.desiredSection}`}
                    secondary={`WhatsApp: ${match.whatsappNumber}`}
                  />
                </ListItem>
                {index < matches.matches.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              Contact this person directly to arrange a section swap.
            </Alert>
          </Box>
        </Paper>
      )}
      
      {matches?.matchType === 'three-way' && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="success.main">
            Three-Way Swap Possible!
          </Typography>
          <Typography variant="body1" paragraph>
            We found a group of three people where each can get their desired section by swapping.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {matches.matches.map((group, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Swap Group #{index + 1}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Person 1 (You)</Typography>
                      <Typography>
                        Has: <Chip label={group.person1.currentSection} size="small" /> 
                        Wants: <Chip label={group.person1.desiredSection} size="small" color="secondary" />
                      </Typography>
                      <Typography>Contact: {group.person1.whatsappNumber}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Person 2</Typography>
                      <Typography>
                        Has: <Chip label={group.person2.currentSection} size="small" /> 
                        Wants: <Chip label={group.person2.desiredSection} size="small" color="secondary" />
                      </Typography>
                      <Typography>Contact: {group.person2.whatsappNumber}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1">Person 3</Typography>
                      <Typography>
                        Has: <Chip label={group.person3.currentSection} size="small" /> 
                        Wants: <Chip label={group.person3.desiredSection} size="small" color="secondary" />
                      </Typography>
                      <Typography>Contact: {group.person3.whatsappNumber}</Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info">
                        This three-way swap would satisfy everyone's needs. Contact the other participants to arrange the swap.
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {matches?.matchType === 'none' && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            No Matches Found Yet
          </Typography>
          <Typography variant="body1" paragraph>
            We couldn't find any direct or three-way matches for your request at this time.
          </Typography>
          <Typography variant="body1">
            Your request has been saved, and visit again after while to see .
          </Typography>
        </Paper>
      )}
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
        >
          Check for New Matches
        </Button>
      </Box>
    </Container>
  );
};

export default MatchesPage;