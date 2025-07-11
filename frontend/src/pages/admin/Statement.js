import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  ButtonGroup
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminStatement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statementBills, setStatementBills] = useState([]);
  const [statementError, setStatementError] = useState('');
  const [loadingStatement, setLoadingStatement] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Billing Statement
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4} lg={4}>
            <Autocomplete
              options={users}
              getOptionLabel={u => u ? `${u.firstName} ${u.lastName} (${u.email})` : ''}
              value={selectedUser}
              onChange={(e, value) => setSelectedUser(value)}
              renderInput={params => (
                <TextField {...params} label="User" margin="normal" required fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option && value && option._id === value._id}
            />
          </Grid>
          <Grid item xs={6} md={3} lg={2}>
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: toDate || today, max: today }}
              error={!!statementError}
              helperText={statementError || ''}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} md={3} lg={2}>
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: fromDate || undefined, max: today }}
              error={!!statementError}
              helperText={statementError || ''}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3} lg={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', mt: { xs: 2, md: 0 } }}>
            <ButtonGroup variant="contained" color="primary" aria-label="download statement" sx={{ gap: 1 }}>
              <Button onClick={handleDownloadStatementPDF} disabled={!selectedUser || statementBills.length === 0 || !!statementError || loadingStatement}>
                Download PDF
              </Button>
              <Button onClick={handleDownloadStatementExcel} disabled={!selectedUser || statementBills.length === 0 || !!statementError || loadingStatement}>
                Download Excel
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Paper>
      {/* Card-based bill display, like client Billing.js */}
      {loadingStatement ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress />
        </Box>
      ) : statementError ? (
        <Alert severity="error">{statementError}</Alert>
      ) : !selectedUser ? (
        <Alert severity="info">Please select a user to view bills.</Alert>
      ) : statementBills.length === 0 ? (
        <Alert severity="warning">No bills found for the selected user and period.</Alert>
      ) : (
        statementBills.map((bill) => (
          <Paper key={bill._id} sx={{ p: 3, mb: 3 }} variant="outlined">
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>{bill.particulars}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Bill Date: {new Date(bill.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Due Date: {new Date(bill.dueDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="h6">
                   ₹{Number(bill.amount).toFixed(2)}
                </Typography>
                <Typography variant="subtitle1" color={bill.outstandingAmount > 0 ? 'error.main' : 'success.main'}>
                  Outstanding:  ₹{Number(bill.outstandingAmount).toFixed(2)}
                </Typography>
                {bill.billFile && (
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
                )}
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom component="div">
                <strong>Payment History</strong>
              </Typography>
              {bill.payments && bill.payments.length > 0 ? (
                <TableContainer>
                  <Table size="small" aria-label="payments">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bill.payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell align="right"> ₹{Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell>{payment.remark || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" sx={{ my: 2, fontStyle: 'italic' }}>
                  No payments have been made for this bill yet.
                </Typography>
              )}
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default AdminStatement; 