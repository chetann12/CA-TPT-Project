// AdminBilling.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';

function addDays(dateStr, days = 30) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const AdminBilling = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userId: '',
    date: '',
    particulars: '',
    billNumber: '',
    amount: '',
    dueDate: '',
    billFile: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [outstandingList, setOutstandingList] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/users')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : res.data.users || []))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (form.date) {
      setForm(f => ({ ...f, dueDate: addDays(f.date, 30) }));
    }
  }, [form.date]);

  useEffect(() => {
    if (tab === 1) {
      axios.get('/api/admin/outstanding')
        .then(res => setOutstandingList(res.data))
        .catch(() => setOutstandingList([]));
    }
  }, [tab]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserChange = (event, value) => {
    setForm({ ...form, userId: value ? value._id : '' });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, billFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });
      await axios.post('/api/billing', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setForm({ userId: form.userId, date: '', particulars: '', billNumber: '', amount: '', dueDate: '', billFile: null });
    } catch {
      setError('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Billing Management</Typography>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Bill Creation" />
        <Tab label="Outstanding by Client" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={7}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Create New Bill
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={u => `${u.firstName} ${u.lastName} (${u.email})`}
                      value={users.find(u => u._id === form.userId) || null}
                      onChange={handleUserChange}
                      renderInput={params => (
                        <TextField {...params} label="User" required fullWidth />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Due Date"
                      name="dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Particulars"
                      name="particulars"
                      value={form.particulars}
                      onChange={handleChange}
                      fullWidth
                      required
                      multiline
                      minRows={3}
                      inputProps={{ maxLength: 1000 }}
                      helperText={`${form.particulars.length}/1000`}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Bill Number"
                      name="billNumber"
                      value={form.billNumber}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Billing Amount"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      fullWidth
                      required
                      type="number"
                      InputProps={{
                        inputProps: {
                          min: 0,
                          inputMode: 'numeric',
                          pattern: '[0-9]*'
                        },
                        sx: {
                          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0
                          },
                          '& input[type=number]': {
                            MozAppearance: 'textfield'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined" component="label">
                      Upload Bill PDF
                      <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
                    </Button>
                    {form.billFile && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {form.billFile.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Saving...' : 'Create Bill'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Outstanding Amount by Client
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Total Outstanding (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outstandingList.map(row => (
                  <TableRow key={row.userId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.outstanding.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Bill created successfully!
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBilling;
