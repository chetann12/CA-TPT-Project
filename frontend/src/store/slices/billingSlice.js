import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchBills = createAsyncThunk(
  'billing/fetchBills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/billing');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBill = createAsyncThunk(
  'billing/createBill',
  async ({ userId, amount, dueDate, description, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('amount', amount);
      formData.append('dueDate', dueDate);
      formData.append('description', description);
      if (file) {
        formData.append('billFile', file);
      }

      const response = await api.post('/billing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBill = createAsyncThunk(
  'billing/updateBill',
  async ({ billId, updates, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(updates).forEach(key => {
        formData.append(key, updates[key]);
      });
      if (file) {
        formData.append('billFile', file);
      }

      const response = await api.patch(`/billing/${billId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addPayment = createAsyncThunk(
  'billing/addPayment',
  async ({ billId, payment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/billing/${billId}/payments`, payment);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteBill = createAsyncThunk(
  'billing/deleteBill',
  async (billId, { rejectWithValue }) => {
    try {
      await api.delete(`/billing/${billId}`);
      return billId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  bills: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBillingError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bills
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bills';
      })
      // Create Bill
      .addCase(createBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills.push(action.payload);
        state.uploadProgress = 100;
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create bill';
        state.uploadProgress = 0;
      })
      // Update Bill
      .addCase(updateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.map(bill =>
          bill._id === action.payload._id ? action.payload : bill
        );
        state.uploadProgress = 100;
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update bill';
        state.uploadProgress = 0;
      })
      // Add Payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.map(bill =>
          bill._id === action.payload._id ? action.payload : bill
        );
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add payment';
      })
      // Delete Bill
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.filter(bill => bill._id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete bill';
      });
  },
});

export const { clearBillingError, setUploadProgress } = billingSlice.actions;

// Selectors
export const selectBills = (state) => state.billing.bills;
export const selectBillingLoading = (state) => state.billing.loading;
export const selectBillingError = (state) => state.billing.error;
export const selectBillingUploadProgress = (state) => state.billing.uploadProgress;

export default billingSlice.reducer; 