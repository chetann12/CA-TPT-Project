import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Grid, Paper, Stack, Button } from '@mui/material';
import { selectUser } from '../store/slices/authSlice';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Dashboard = () => {
  const user = useSelector(selectUser);

  return <>
   <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
  <Box sx={{ flexGrow: 1 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <DashboardIcon color="primary" sx={{ fontSize: 48 }} />
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome{user ? `, ${user.name}` : ''}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is your dashboard. Quickly access your documents, profile, billing, and more.
          </Typography>
        </Box>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <DescriptionIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View and download your important documents.
            </Typography>
            <Button variant="contained" color="primary" href="/documents" size="small">
              Go to Documents
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <PersonIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage your personal and account information.
            </Typography>
            <Button variant="contained" color="primary" href="/profile" size="small">
              Go to Profile
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <ReceiptIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Billing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View your bills and payment history.
            </Typography>
            <Button variant="contained" color="primary" href="/billing" size="small">
              Go to Billing
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </Box>
  </>
};

export default Dashboard; 