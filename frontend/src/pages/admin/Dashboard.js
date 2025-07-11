import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DocumentIcon,
  Receipt as BillingIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  fetchSystemStats,
  clearAdminError,
  selectSystemStats,
  selectAdminLoading,
  selectAdminError,
} from '../../store/slices/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const systemStats = useSelector(selectSystemStats);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);

  useEffect(() => {
    dispatch(fetchSystemStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
          {error}
        </Alert>
      )}

      {systemStats && (
        <Grid container spacing={3}>
          {/* System Statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h4">{systemStats.totalUsers}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Users
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h4">{systemStats.activeUsers}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Users
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DocumentIcon color="info" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h4">{systemStats.totalDocuments}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Documents
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BillingIcon color="secondary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h4">{systemStats.totalBills}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Bills
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem button component="a" href="/admin/users">
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Manage Users" 
                    secondary="View and manage all users"
                  />
                </ListItem>
                <ListItem button component="a" href="/admin/documents">
                  <ListItemIcon>
                    <DocumentIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Document Management" 
                    secondary="Upload and manage documents"
                  />
                </ListItem>
                <ListItem button component="a" href="/admin/billing">
                  <ListItemIcon>
                    <BillingIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Billing Management" 
                    secondary="Manage billing and payments"
                  />
                </ListItem>
                <ListItem button component="a" href="/admin/statement">
                  <ListItemIcon>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Billing Statement" 
                    secondary="Download user billing statements"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Pending Bills Alert */}
          {systemStats.pendingBills > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {systemStats.pendingBills} Pending Bills
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  There are {systemStats.pendingBills} unpaid bills that require attention.
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* System Health */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6">User Activity</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {systemStats.activeUsers} / {systemStats.totalUsers} active
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}%`}
                          color="success"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6">Document Coverage</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {systemStats.totalDocuments} documents
                          </Typography>
                        </Box>
                        <TrendingUpIcon color="primary" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6">Payment Status</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {systemStats.pendingBills} pending
                          </Typography>
                        </Box>
                        {systemStats.pendingBills > 0 ? (
                          <Chip label="Action Required" color="warning" />
                        ) : (
                          <Chip label="All Clear" color="success" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6">System Status</Typography>
                          <Typography variant="body2" color="text.secondary">
                            All systems operational
                          </Typography>
                        </Box>
                        <CheckCircleIcon color="success" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard; 