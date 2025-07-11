import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Grid, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Link
} from '@mui/material';
import { fetchBills, selectBills } from '../store/slices/billingSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Billing = () => {
  const dispatch = useDispatch();
  const bills = useSelector(selectBills);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  useEffect(() => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setDateError('From Date cannot be after To Date');
    } else {
      setDateError('');
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    let filtered = bills;
    if (fromDate) {
      filtered = filtered.filter(bill => new Date(bill.createdAt) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(bill => new Date(bill.createdAt) <= new Date(toDate));
    }
    setFilteredBills(filtered);
  }, [bills, fromDate, toDate]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableRows = [];
    const tableHeaders = ['Bill Date', 'Party Name', 'Bill No.', 'Particulars', 'Bill Amount', 'Due Date', 'Payment Date', 'Payment Amount', 'Payment Method', 'Outstanding', 'Remark'];
    let totalOutstanding = 0;
    let totalPaid = 0;

    filteredBills.forEach(bill => {
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
      if (bill.payments.length > 0) {
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

  const handleDownloadExcel = () => {
    const data = [];
    let totalOutstanding = 0;
    let totalPaid = 0;
    filteredBills.forEach(bill => {
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
      if (bill.payments.length > 0) {
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
    // Add summary row
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
        Billing Statement
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: toDate || undefined }}
              error={!!dateError}
              helperText={dateError || ''}
            />
          </Grid>
          <Grid item>
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: fromDate || undefined }}
              error={!!dateError}
              helperText={dateError || ''}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleDownloadPDF}>Download PDF</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleDownloadExcel}>Download Excel</Button>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredBills.map((bill) => (
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
                 ₹{bill.amount.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" color={bill.outstandingAmount > 0 ? 'error.main' : 'success.main'}>
                Outstanding:  ₹{bill.outstandingAmount.toFixed(2)}
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
            {bill.payments.length > 0 ? (
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
                        <TableCell align="right"> ₹{payment.amount.toFixed(2)}</TableCell>
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
      ))}
    </Box>
  );
};

export default Billing; 