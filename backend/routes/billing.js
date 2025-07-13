const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const Billing = require('../models/Billing');

// Configure multer for bill file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/bills');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get bills (admin: all, user: own)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    // If the user is an admin, they can query by userId, otherwise they get all bills.
    if (req.user.role === 'admin') {
      if (req.query.userId) {
        query.userId = req.query.userId;
      }
    } else {
      // If the user is not an admin, they can only get their own bills.
      query.userId = req.user.id;
    }

    // Add date range filtering if provided
    if (req.query.fromDate || req.query.toDate) {
      query.createdAt = {};
      if (req.query.fromDate) {
        query.createdAt.$gte = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        // To include the whole day, set time to end of day
        const toDate = new Date(req.query.toDate);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const bills = await Billing.find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .populate('userId', 'firstName lastName email');
      
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// Get bill details
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Billing.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ message: 'Error fetching bill' });
  }
});

// Download bill PDF
router.get('/:id/download', auth, async (req, res) => {
  try {
    const bill = await Billing.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill || !bill.billFile) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.download(bill.billFile.filePath, bill.billFile.fileName);
  } catch (error) {
    console.error('Error downloading bill:', error);
    res.status(500).json({ message: 'Error downloading bill' });
  }
});

// Admin: Create new bill
router.post('/', adminAuth, upload.single('billFile'), async (req, res) => {
  try {
    const billData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Ensure particulars is present
    if (!billData.particulars || billData.particulars.trim() === '') {
      return res.status(400).json({ message: 'Particulars is required' });
    }

    if (req.file) {
      billData.billFile = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        uploadDate: new Date()
      };
    }

    const bill = new Billing(billData);
    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: 'Error creating bill', error: error.message });
  }
});

// Admin: Update bill
router.patch('/:id', adminAuth, upload.single('billFile'), async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => {
      if (update !== 'billFile') {
        bill[update] = req.body[update];
      }
    });

    if (req.file) {
      // Delete old file if exists
      if (bill.billFile && bill.billFile.filePath) {
        const fs = require('fs');
        if (fs.existsSync(bill.billFile.filePath)) {
          fs.unlinkSync(bill.billFile.filePath);
        }
      }

      bill.billFile = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        uploadDate: new Date()
      };
    }

    await bill.save();
    res.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ message: 'Error updating bill' });
  }
});

// Admin: Add payment record
router.post('/:id/payments', adminAuth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    bill.payments.push(req.body);
    
    // Update bill status
    const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid >= bill.amount) {
      bill.status = 'Paid';
    } else if (totalPaid > 0) {
      bill.status = 'Partially Paid';
    }

    await bill.save();
    res.json(bill);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Error adding payment' });
  }
});

// Admin: Update a payment record
router.patch('/:billId/payments/:paymentId', adminAuth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    const payment = bill.payments.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    // Update fields
    if (req.body.amount !== undefined) payment.amount = req.body.amount;
    if (req.body.date !== undefined) payment.date = req.body.date;
    if (req.body.paymentMethod !== undefined) payment.paymentMethod = req.body.paymentMethod;
    if (req.body.remark !== undefined) payment.remark = req.body.remark;
    await bill.save();
    res.json(bill);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Error updating payment' });
  }
});

// Admin: Delete a payment record
router.delete('/:billId/payments/:paymentId', adminAuth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    const payment = bill.payments.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.remove();
    await bill.save();
    res.json(bill);
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Error deleting payment' });
  }
});

// Admin: Delete bill
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Delete bill file if exists
    if (bill.billFile && bill.billFile.filePath) {
      const fs = require('fs');
      if (fs.existsSync(bill.billFile.filePath)) {
        fs.unlinkSync(bill.billFile.filePath);
      }
    }

    await bill.remove();
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ message: 'Error deleting bill' });
  }
});

module.exports = router; 