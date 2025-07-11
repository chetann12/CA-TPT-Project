const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Document = require('../models/Document');
const Billing = require('../models/Billing');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get system statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalDocuments = await Document.countDocuments();
    const totalBills = await Billing.countDocuments();
    const pendingBills = await Billing.countDocuments({ status: 'Unpaid' });

    res.json({
      totalUsers,
      activeUsers,
      totalDocuments,
      totalBills,
      pendingBills
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get all users with pagination and search
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { pan: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get single user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's documents
    const documents = await Document.find({ userId: user._id })
      .sort({ createdAt: -1 });

    // Get user's billing
    const billing = await Billing.find({ userId: user._id })
      .sort({ createdAt: -1 });

    // Format user data for admin view
    const userData = {
      _id: user._id,
      userType: user.userType,
      email: user.email,
      mobile: user.mobile,
      pan: user.pan,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      loginAttempts: user.loginAttempts,
      lockUntil: user.lockUntil,
      deactivationReason: user.deactivationReason,
      
      // Individual/HUF specific fields
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      tradeName: user.tradeName,
      fatherFirstName: user.fatherFirstName,
      fatherMiddleName: user.fatherMiddleName,
      fatherLastName: user.fatherLastName,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gstNumber: user.gstNumber,
      aadharNumber: user.aadharNumber,
      bankDetails: user.bankDetails,
      
      // Company/LLP/Partnership specific fields
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      dateOfIncorporation: user.dateOfIncorporation,
      directorDetails: user.directorDetails ? {
        name: user.directorDetails.name,
        pan: user.directorDetails.pan,
        din: user.directorDetails.din
      } : undefined,
    };

    res.json({
      user: userData,
      documents,
      billing
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        ...(reason && { deactivationReason: reason }),
        ...(isActive && { deactivationReason: null })
      },
      { new: true }
    ).select('-password -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Upload document for a specific user
router.post('/users/:id/documents', adminAuth, upload.single('document'), async (req, res) => {
  try {
    const { category, documentType, financialYear, description } = req.body;
    const userId = req.params.id;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create document record
    const document = new Document({
      userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category,
      documentType,
      financialYear,
      description,
      uploadedBy: req.user._id, // Admin who uploaded
      isAdminUpload: true
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Get document categories and types
router.get('/document-categories', adminAuth, (req, res) => {
  const categories = {
    'income-tax': {
      name: 'Section 1 – Income Tax (Financial Year wise)',
      types: [
        'Income Tax Return Acknowledgement',
        'Income Tax Computation',
        'Balance Sheet',
        'Profit and Loss Account',
        'Annexures',
        'Audit Report',
        'Director Report',
        'Others'
      ]
    },
    'gst': {
      name: 'Section 2 – GST (Financial Year wise)',
      types: [
        'GSTR3B',
        'GSTR1',
        'Others'
      ]
    }
  };

  res.json(categories);
});

// Get user's documents
router.get('/users/:id/documents', adminAuth, async (req, res) => {
  try {
    const { category, financialYear } = req.query;
    let query = { userId: req.params.id };

    if (category) query.category = category;
    if (financialYear) query.financialYear = financialYear;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ message: 'Error fetching user documents' });
  }
});

// Delete document
router.delete('/documents/:id', adminAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only admin can delete documents
    if (!document.isAdminUpload) {
      return res.status(403).json({ message: 'Only admin can delete this document' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

// Get document access logs
router.get('/logs/documents', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query['accessLogs.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (userId) {
      query['accessLogs.userId'] = userId;
    }

    const documents = await Document.find(query)
      .populate('userId', 'name pan')
      .populate('accessLogs.userId', 'name pan')
      .select('fileName documentType accessLogs');

    const logs = documents.flatMap(doc => 
      doc.accessLogs.map(log => ({
        documentName: doc.fileName,
        documentType: doc.documentType,
        userName: log.userId.name,
        userPan: log.userId.pan,
        action: log.action,
        timestamp: log.timestamp
      }))
    );

    res.json(logs);
  } catch (error) {
    console.error('Error fetching document logs:', error);
    res.status(500).json({ message: 'Error fetching document logs' });
  }
});

// Get overdue bills
router.get('/bills/overdue', adminAuth, async (req, res) => {
  try {
    const overdueBills = await Billing.find({
      status: { $ne: 'Paid' },
      dueDate: { $lt: new Date() }
    })
    .populate('userId', 'name pan email mobile')
    .sort({ dueDate: 1 });

    res.json(overdueBills);
  } catch (error) {
    console.error('Error fetching overdue bills:', error);
    res.status(500).json({ message: 'Error fetching overdue bills' });
  }
});

// Bulk deactivate users with overdue payments
router.post('/users/deactivate-overdue', adminAuth, async (req, res) => {
  try {
    const { daysOverdue } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    const overdueBills = await Billing.find({
      status: { $ne: 'Paid' },
      dueDate: { $lt: cutoffDate }
    }).distinct('userId');

    await User.updateMany(
      { _id: { $in: overdueBills } },
      { $set: { isActive: false } }
    );

    res.json({ 
      message: 'Users deactivated successfully',
      count: overdueBills.length
    });
  } catch (error) {
    console.error('Error deactivating users:', error);
    res.status(500).json({ message: 'Error deactivating users' });
  }
});

// Get user activity summary
router.get('/users/:id/activity', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const documentAccess = await Document.aggregate([
      { $match: { userId: user._id } },
      { $unwind: '$accessLogs' },
      { $group: {
        _id: null,
        totalViews: {
          $sum: { $cond: [{ $eq: ['$accessLogs.action', 'view'] }, 1, 0] }
        },
        totalDownloads: {
          $sum: { $cond: [{ $eq: ['$accessLogs.action', 'download'] }, 1, 0] }
        },
        lastAccess: { $max: '$accessLogs.timestamp' }
      }}
    ]);

    const billingSummary = await Billing.aggregate([
      { $match: { userId: user._id } },
      { $group: {
        _id: null,
        totalBills: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        paidAmount: {
          $sum: {
            $reduce: {
              input: '$payments',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          }
        }
      }}
    ]);

    res.json({
      lastLogin: user.lastLogin,
      documentAccess: documentAccess[0] || { totalViews: 0, totalDownloads: 0 },
      billingSummary: billingSummary[0] || { totalBills: 0, totalAmount: 0, paidAmount: 0 }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Error fetching user activity' });
  }
});

router.get('/outstanding', async (req, res) => {
  try {
    const data = await Billing.getOutstandingByUser();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch outstanding amounts' });
  }
});

module.exports = router; 