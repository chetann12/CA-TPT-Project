const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  particulars: {
    type: String,
    required: true
  },
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Partially Paid', 'Unpaid'],
    default: 'Unpaid'
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      required: true
    },
    remark: String
  }],
  billFile: {
    fileName: String,
    filePath: String,
    uploadDate: Date
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating outstanding amount
billingSchema.virtual('outstandingAmount').get(function() {
  const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return this.amount - totalPaid;
});

// Method to check if bill is overdue
billingSchema.methods.isOverdue = function() {
  return this.dueDate < new Date() && this.status !== 'Paid';
};

// Index for efficient querying
billingSchema.index({ userId: 1, status: 1, dueDate: 1 });

billingSchema.statics.getOutstandingByUser = async function() {
  return this.aggregate([
    {
      $group: {
        _id: "$userId",
        outstanding: {
          $sum: {
            $subtract: ["$amount", { $sum: "$payments.amount" }]
          }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$_id",
        name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
        email: "$user.email",
        outstanding: 1,
        _id: 0
      }
    }
  ]);
};

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing; 