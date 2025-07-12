import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Divider,
  Autocomplete,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from '../../utils/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
const AllBills = () => {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [paymentForms, setPaymentForms] = useState({}); // {billId: {date, amount, method, remark}}
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState('');
  const [editingPayment, setEditingPayment] = useState({}); // {paymentId: {fields...}}
  const [deleteDialog, setDeleteDialog] = useState({ open: false, billId: null, paymentId: null });

  // Billing Statement state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statementBills, setStatementBills] = useState([]);
  const [statementError, setStatementError] = useState('');
  const [loadingStatement, setLoadingStatement] = useState(false);

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    axios.get('/api/billing')
      .then(res => setBills(res.data))
      .catch(() => setBills([]));
  }, [refresh]);

  useEffect(() => {
    if (!search) {
      setFiltered(bills);
    } else {
      const s = search.toLowerCase();
      setFiltered(bills.filter(bill =>
        (bill.userId?.firstName + ' ' + bill.userId?.lastName + ' ' + bill.userId?.email).toLowerCase().includes(s) ||
        (bill.billNumber || '').toLowerCase().includes(s) ||
        (bill.particulars || '').toLowerCase().includes(s)
      ));
    }
  }, [search, bills]);

  // Fetch users for dropdown
  useEffect(() => {
    axios.get('/api/admin/users')
      .then(res => {
        if (Array.isArray(res.data)) setUsers(res.data);
        else if (Array.isArray(res.data.users)) setUsers(res.data.users);
        else setUsers([]);
      })
      .catch(() => setUsers([]));
  }, []);

  // Fetch bills for selected user and date range
  useEffect(() => {
    if (!selectedUser || !selectedUser._id) {
      setStatementBills([]);
      return;
    }
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setStatementError('From Date cannot be after To Date');
      setStatementBills([]);
      return;
    } else {
      setStatementError('');
    }
    setLoadingStatement(true);
    axios.get('/api/billing', {
      params: {
        userId: selectedUser._id,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      }
    })
      .then(res => setStatementBills(res.data))
      .catch(() => setStatementBills([]))
      .finally(() => setLoadingStatement(false));
  }, [selectedUser, fromDate, toDate]);

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
      setRefresh(r => !r);
    } catch (err) {
      setError('Failed to add payment');
    }
  };

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
      setRefresh(r => !r);
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
      setRefresh(r => !r);
    } catch (err) {
      setError('Failed to delete payment');
    }
  };

  // Export logic (copied/adapted from client Billing.js)
  const handleDownloadStatementPDF = () => {
    const doc = new jsPDF();
    const tableRows = [];
    const tableHeaders = ['Bill Date', 'Party Name', 'Bill No.', 'Particulars', 'Bill Amount', 'Due Date', 'Payment Date', 'Payment Amount', 'Payment Method', 'Outstanding', 'Remark'];
    let totalOutstanding = 0;
    let totalPaid = 0;
    statementBills.forEach(bill => {
      const partyName = bill.userId && (bill.userId.firstName || bill.userId.lastName) ? `${bill.userId.firstName || ''} ${bill.userId.lastName || ''}`.trim() : '';
      tableRows.push([
        new Date(bill.createdAt).toLocaleDateString(),
        partyName,
        bill.billNumber,
        bill.particulars,
        bill.amount,
        new Date(bill.dueDate).toLocaleDateString(),
        '', '', '',
        bill.outstandingAmount,
        ''
      ]);
      totalOutstanding += bill.outstandingAmount;
      if (bill.payments && bill.payments.length > 0) {
        bill.payments.forEach(payment => {
          tableRows.push([
            '', '', '', '', '', '',
            new Date(payment.date).toLocaleDateString(),
            payment.amount,
            payment.paymentMethod,
            '',
            payment.remark
          ]);
          totalPaid += payment.amount;
        });
      } else {
        tableRows.push(['', '', '', '', '', '', 'Payment is yet to come.', '', '', '', '']);
      }
    });
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
    });
    doc.text(`Total Outstanding: Rs.${totalOutstanding.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Amount Paid: Rs.${totalPaid.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 18);
    doc.save('billing-statement.pdf');
  };
  const handleDownloadStatementExcel = () => {
    const data = [];
    let totalOutstanding = 0;
    let totalPaid = 0;
    statementBills.forEach(bill => {
      const partyName = bill.userId && (bill.userId.firstName || bill.userId.lastName) ? `${bill.userId.firstName || ''} ${bill.userId.lastName || ''}`.trim() : '';
      data.push({
        'Bill Date': new Date(bill.createdAt).toLocaleDateString(),
        'Party Name': partyName,
        'Bill No.': bill.billNumber,
        'Particulars': bill.particulars,
        'Bill Amount': bill.amount,
        'Due Date': new Date(bill.dueDate).toLocaleDateString(),
        'Payment Date': '',
        'Payment Amount': '',
        'Payment Method': '',
        'Outstanding': bill.outstandingAmount,
        'Remark': ''
      });
      totalOutstanding += bill.outstandingAmount;
      if (bill.payments && bill.payments.length > 0) {
        bill.payments.forEach(payment => {
          data.push({
            'Bill Date': '',
            'Party Name': '',
            'Bill No.': '',
            'Particulars': '',
            'Bill Amount': '',
            'Due Date': '',
            'Payment Date': new Date(payment.date).toLocaleDateString(),
            'Payment Amount': payment.amount,
            'Payment Method': payment.paymentMethod,
            'Outstanding': '',
            'Remark': payment.remark
          });
          totalPaid += payment.amount;
        });
      } else {
        data.push({ 'Payment Date': 'Payment is yet to come.' });
      }
    });
    data.push({
      'Bill Date': '',
      'Party Name': '',
      'Bill No.': '',
      'Particulars': '',
      'Bill Amount': '',
      'Due Date': '',
      'Payment Date': '',
      'Payment Amount': '',
      'Payment Method': '',
      'Outstanding': `Total Outstanding: ₹${totalOutstanding.toFixed(2)}`,
      'Remark': `Total Amount Paid: ₹${totalPaid.toFixed(2)}`
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');
    XLSX.writeFile(workbook, 'billing-statement.xlsx');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        All Bills
      </Typography>
      <Paper sx={{ p: 2, mb: 3, boxShadow: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              label="Search by user, bill no, particulars"
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Particulars</TableCell>
                <TableCell>Bill No</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Outstanding</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>PDF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bill, idx) => (
                <React.Fragment key={bill._id}>
                  <TableRow sx={{ backgroundColor: idx % 2 === 0 ? '#fafbfc' : '#f5f7fa', borderTop: idx !== 0 ? '3px solid #e0e0e0' : undefined }}>
                    <TableCell>{bill.userId ? `${bill.userId.firstName} ${bill.userId.lastName} (${bill.userId.email})` : ''}</TableCell>
                    <TableCell>{bill.date ? bill.date.slice(0, 10) : (bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '')}</TableCell>
                    <TableCell>{bill.particulars}</TableCell>
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>{bill.amount}</TableCell>
                    <TableCell>{bill.outstandingAmount !== undefined ? bill.outstandingAmount : (bill.amount - (bill.payments?.reduce((s, p) => s + p.amount, 0) || 0))}</TableCell>
                    <TableCell>{bill.dueDate ? bill.dueDate.slice(0, 10) : ''}</TableCell>
                    <TableCell>
                      {bill.billFile && bill.billFile.filePath ? (
                        <Button
                          variant="outlined"
                          size="small"
                          href={`http://localhost:5000/${bill.billFile.filePath.replace(/\\/g, '/')}`}
                          target="_blank"
                          rel="noopener"
                          sx={{ mt: 1 }}
                        >
                          Download Bill
                        </Button>
                      ) : (
                        <Button variant="outlined" size="small" disabled>No PDF</Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {/* Payments and Add Payment Form */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ background: '#f3f6fa', p: 2, borderBottom: '2px solid #e0e0e0' }}>
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Payments:</Typography>
                        {bill.payments && bill.payments.length > 0 ? (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Method</TableCell>
                                <TableCell>Remark</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {bill.payments.map((p, idx) => (
                                <TableRow key={p._id || idx}>
                                  {editingPayment[p._id] ? (
                                    <>
                                      <TableCell>
                                        <TextField
                                          name="date"
                                          type="date"
                                          value={editingPayment[p._id].date ? editingPayment[p._id].date.slice(0, 10) : ''}
                                          onChange={e => handleEditPaymentChange(p._id, e)}
                                          size="small"
                                          InputLabelProps={{ shrink: true }}
                                          fullWidth
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          name="amount"
                                          type="number"
                                          value={editingPayment[p._id].amount}
                                          onChange={e => handleEditPaymentChange(p._id, e)}
                                          size="small"
                                          fullWidth
                                          inputProps={{ min: 0, inputMode: 'numeric', pattern: '[0-9]*', style: { MozAppearance: 'textfield' } }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          name="paymentMethod"
                                          value={editingPayment[p._id].paymentMethod || ''}
                                          onChange={e => handleEditPaymentChange(p._id, e)}
                                          size="small"
                                          fullWidth
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          name="remark"
                                          value={editingPayment[p._id].remark || ''}
                                          onChange={e => handleEditPaymentChange(p._id, e)}
                                          size="small"
                                          fullWidth
                                        />
                                      </TableCell>
                                    </>
                                  ) : (
                                    <>
                                      <TableCell>{p.date ? p.date.slice(0, 10) : ''}</TableCell>
                                      <TableCell>{p.amount}</TableCell>
                                      <TableCell>{p.paymentMethod}</TableCell>
                                      <TableCell>{p.remark}</TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography variant="body2" sx={{ my: 2, fontStyle: 'italic' }}>
                            No payments yet.
                          </Typography>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Add Payment:
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <TextField
                                label="Date"
                                name="date"
                                type="date"
                                value={paymentForms[bill._id]?.date || ''}
                                onChange={e => handlePaymentChange(bill._id, e)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <TextField
                                label="Amount"
                                name="amount"
                                type="number"
                                value={paymentForms[bill._id]?.amount || ''}
                                onChange={e => handlePaymentChange(bill._id, e)}
                                size="small"
                                fullWidth
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
                            <Grid item xs={12} sm={3}>
                              <TextField
                                label="Method"
                                name="paymentMethod"
                                value={paymentForms[bill._id]?.paymentMethod || ''}
                                onChange={e => handlePaymentChange(bill._id, e)}
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                label="Remark"
                                name="remark"
                                value={paymentForms[bill._id]?.remark || ''}
                                onChange={e => handlePaymentChange(bill._id, e)}
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAddPayment(bill._id)}
                              >
                                Add Payment
                              </Button>
                            </Grid>
                          </Grid>
                      </Box>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
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

export default AllBills; 