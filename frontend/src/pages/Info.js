import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GavelIcon from '@mui/icons-material/Gavel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';
import BookIcon from '@mui/icons-material/Book';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { selectUser } from '../store/slices/authSlice';

const Info = () => {
  const user = useSelector(selectUser);
  return (
    <Box sx={{ mt: 3 }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
          <Typography variant="h4" fontWeight={700}>
            About CA TPT & Associates
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Welcome{user ? `, ${user.name}` : ''}!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          CA TPT & Associates is a leading Chartered Accountancy firm with over a decade of experience, providing trusted financial, tax, and advisory services to startups, SMEs, and corporates. Our mission is to empower clients with reliable guidance and transparent solutions.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Our Services
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><AssignmentTurnedInIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Audit & Assurance" />
          </ListItem>
          <ListItem>
            <ListItemIcon><GavelIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Taxation (Direct & Indirect)" />
          </ListItem>
          <ListItem>
            <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
            <ListItemText primary="GST Compliance" />
          </ListItem>
          <ListItem>
            <ListItemIcon><BusinessIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Company Incorporation" />
          </ListItem>
          <ListItem>
            <ListItemIcon><BookIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Accounting & Bookkeeping" />
          </ListItem>
          <ListItem>
            <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Business Advisory" />
          </ListItem>
        </List>
        <Divider sx={{ my: 3 }} />
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="10+ years of industry experience" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Serving 500+ satisfied clients" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Expertise in Tax, Audit, GST, and Business Advisory" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Client-centric, timely, and transparent service" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Info; 