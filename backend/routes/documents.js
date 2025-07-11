const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const Document = require('../models/Document');

// Configure multer for file upload
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
  storage,
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

// Get documents by category and financial year
router.get('/', auth, async (req, res) => {
  try {
    const { category, financialYear } = req.query;
    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (financialYear) query.financialYear = financialYear;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Get document categories
router.get('/categories', auth, (req, res) => {
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

// Upload document (admin only)
router.post('/upload', adminAuth, upload.single('document'), async (req, res) => {
  try {
    const { userId, category, documentType, financialYear, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = new Document({
      userId,
      category,
      documentType,
      financialYear,
      description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      isAdminUpload: true
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Download document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Log access
    document.accessLogs.push({
      userId: req.user._id,
      action: 'download',
      timestamp: new Date()
    });
    await document.save();

    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
});

// View document
router.get('/:id/view', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Log access
    document.accessLogs.push({
      userId: req.user._id,
      action: 'view',
      timestamp: new Date()
    });
    await document.save();

    res.sendFile(document.filePath);
  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({ message: 'Error viewing document' });
  }
});

// Delete document (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only admin can delete admin-uploaded documents
    if (!document.isAdminUpload) {
      return res.status(403).json({ message: 'Only admin can delete this document' });
    }

    // Delete file from storage
    const fs = require('fs');
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

module.exports = router; 