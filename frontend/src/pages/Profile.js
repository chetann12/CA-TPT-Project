import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import axios from '../utils/axios';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch user profile
    axios.get('/api/profile')
      .then(res => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch(() => setError('Failed to load profile'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFatherChange = (e) => {
    setForm({
      ...form,
      fatherFirstName: e.target.name === 'fatherFirstName' ? e.target.value : form.fatherFirstName,
      fatherMiddleName: e.target.name === 'fatherMiddleName' ? e.target.value : form.fatherMiddleName,
      fatherLastName: e.target.name === 'fatherLastName' ? e.target.value : form.fatherLastName,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put('/api/profile', form);
      setSuccess(true);
      setProfile(form);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteDialogOpen(false);
    setLoading(true);
    setError('');
    try {
      await axios.patch('/api/profile/deactivate');
      dispatch(logout());
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Name as per PAN */}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Name as per PAN</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label="First Name" name="firstName" value={form.firstName || ''} onChange={handleChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Middle Name" name="middleName" value={form.middleName || ''} onChange={handleChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Last Name" name="lastName" value={form.lastName || ''} onChange={handleChange} fullWidth margin="normal" />
                </Grid>
              </Grid>
              <TextField label="Trade Name (If Any)" name="tradeName" value={form.tradeName || ''} onChange={handleChange} fullWidth margin="normal" />
              {/* Father's Name */}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Father's Name</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Father's First Name" name="fatherFirstName" value={form.fatherFirstName || ''} onChange={handleFatherChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Father's Middle Name" name="fatherMiddleName" value={form.fatherMiddleName || ''} onChange={handleFatherChange} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Father's Last Name" name="fatherLastName" value={form.fatherLastName || ''} onChange={handleFatherChange} fullWidth margin="normal" />
                </Grid>
              </Grid>
              {/* Address */}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Address</Typography>
              <TextField label="Address" name="address" value={form.address || ''} onChange={handleChange} fullWidth margin="normal" multiline minRows={2} />
              {/* Date of Birth */}
              <TextField label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth ? form.dateOfBirth.slice(0, 10) : ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
              {/* PAN and Email (disabled) */}
              <TextField label="PAN" name="pan" value={form.pan || ''} fullWidth margin="normal" disabled />
              <TextField label="Email" name="email" value={form.email || ''} fullWidth margin="normal" disabled />
              {/* GST Number */}
              <TextField label="GST Number (if applicable)" name="gstNumber" value={form.gstNumber || ''} onChange={handleChange} fullWidth margin="normal" />
              <Box sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
                
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 