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
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [bills, setBills] = useState([]);
  const [paymentForms, setPaymentForms] = useState({}); // {billId: {amount, date, method, remark}}
  const [refreshBills, setRefreshBills] = useState(false);
  const [editingPayment, setEditingPayment] = useState({}); // {paymentId: {fields...}}
  const [deleteDialog, setDeleteDialog] = useState({ open: false, billId: null, paymentId: null });
  const [tab, setTab] = useState(0);
  const [outstandingList, setOutstandingList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Fetch all users for dropdown
    axios.get('/api/admin/users')
      .then(res => {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else if (Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        } else {
          setUsers([]);
        }
      })
      .catch(() => setUsers([]));
  }, []);

  // Auto-calculate due date when bill date changes
  useEffect(() => {
    if (form.date) {
      setForm(f => ({ ...f, dueDate: addDays(f.date, 30) }));
    }
  }, [form.date]);

  // Fetch bills for selected user
  useEffect(() => {
    if (form.userId) {
      axios.get('/api/billing', { params: { userId: form.userId } })
        .then(res => setBills(res.data))
        .catch(() => setBills([]));
    } else {
      setBills([]);
    }
  }, [form.userId, success, refreshBills]);

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
      data.append('userId', form.userId);
      data.append('particulars', form.particulars);
      data.append('billNumber', form.billNumber);
      data.append('amount', form.amount);
      data.append('dueDate', form.dueDate);
      if (form.billFile) data.append('billFile', form.billFile);
      if (form.date) data.append('date', form.date);
      await axios.post('/api/billing', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setForm({
        userId: form.userId, date: '', particulars: '', billNumber: '', amount: '', dueDate: '', billFile: null
      });
      setRefreshBills(r => !r); // refresh bills
    } catch (err) {
      setError('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  // Payment form handlers
  const handlePaymentChange = (billId, e) => {
    setPaymentForms({
      ...paymentForms,
      [billId]: {
        ...paymentForms[billId],
        [e.target.name]: e.target.value
      }
    });
  };

  const handleAddPayment = async (billId) => {
    const pf = paymentForms[billId] || {};
    if (!pf.amount || !pf.date) {
      setError('Payment date and amount are required');
      return;
    }
    try {
      await axios.post(`/api/billing/${billId}/payments`, {
        amount: Number(pf.amount),
        date: pf.date,
        paymentMethod: pf.paymentMethod || '',
        remark: pf.remark || ''
      });
      setPaymentForms({ ...paymentForms, [billId]: {} });
      setRefreshBills(r => !r); // refresh bills
    } catch (err) {
      setError('Failed to add payment');
    }
  };

  // Payment edit handlers
  const handleEditPayment = (billId, payment) => {
    setEditingPayment({ ...editingPayment, [payment._id]: { ...payment } });
  };

  const handleEditPaymentChange = (paymentId, e) => {
    setEditingPayment({
      ...editingPayment,
      [paymentId]: {
        ...editingPayment[paymentId],
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSavePayment = async (billId, paymentId) => {
    const pf = editingPayment[paymentId];
    try {
      await axios.patch(`/api/billing/${billId}/payments/${paymentId}`, pf);
      setEditingPayment(ep => { const copy = { ...ep }; delete copy[paymentId]; return copy; });
      setRefreshBills(r => !r);
    } catch (err) {
      setError('Failed to update payment');
    }
  };

  const handleCancelEdit = (paymentId) => {
    setEditingPayment(ep => { const copy = { ...ep }; delete copy[paymentId]; return copy; });
  };

  const handleDeletePayment = async () => {
    try {
      await axios.delete(`/api/billing/${deleteDialog.billId}/payments/${deleteDialog.paymentId}`);
      setDeleteDialog({ open: false, billId: null, paymentId: null });
      setRefreshBills(r => !r);
    } catch (err) {
      setError('Failed to delete payment');
    }
  };

  const userList = Array.isArray(users) ? users : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Billing Management
      </Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Bills" />
        <Tab label="Outstanding by Client" />
      </Tabs>
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={7}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create Bill
              </Typography>
              <form onSubmit={handleSubmit}>
                <Autocomplete
                  options={userList}
                  getOptionLabel={u => u ? `${u.firstName} ${u.lastName} (${u.email})` : ''}
                  value={userList.find(u => u._id === form.userId) || null}
                  onChange={handleUserChange}
                  renderInput={params => (
                    <TextField {...params} label="User" margin="normal" required fullWidth />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
                <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required inputProps={{ max: new Date().toISOString().split('T')[0] }} />
                <TextField
                  label="Particulars"
                  name="particulars"
                  value={form.particulars}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                  multiline
                  minRows={4}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${form.particulars.length}/1000`}
                />
                <TextField label="Bill No" name="billNumber" value={form.billNumber} onChange={handleChange} fullWidth margin="normal" required />
                <TextField label="Billing Amount" name="amount" value={form.amount} onChange={handleChange} fullWidth margin="normal" type="number" required inputProps={{ min: 0, inputMode: 'numeric', pattern: '[0-9]*', style: { MozAppearance: 'textfield' } }} />
                <TextField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                  Upload Bill PDF
                  <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
                </Button>
                {form.billFile && <Typography variant="body2" sx={{ mt: 1 }}>{form.billFile.name}</Typography>}
                <Box sx={{ mt: 2 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Create Bill'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>
      )}
      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Outstanding Amount by Client</Typography>
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
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, billId: null, paymentId: null })}>
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>Are you sure you want to delete this payment?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, billId: null, paymentId: null })}>Cancel</Button>
          <Button color="error" onClick={handleDeletePayment}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBilling; 