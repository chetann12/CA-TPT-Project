import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 10, search = '', status = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'admin/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, isActive, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, {
        isActive,
        reason
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const uploadUserDocument = createAsyncThunk(
  'admin/uploadUserDocument',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/users/${userId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchDocumentCategories = createAsyncThunk(
  'admin/fetchDocumentCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/document-categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUserDocuments = createAsyncThunk(
  'admin/fetchUserDocuments',
  async ({ userId, category, financialYear }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (financialYear) params.append('financialYear', financialYear);

      const response = await api.get(`/admin/users/${userId}/documents?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'admin/deleteDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/documents/${documentId}`);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'admin/fetchSystemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  userDocuments: [],
  documentCategories: {},
  systemStats: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  }
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminSuccess: (state) => {
      state.success = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.user;
        state.userDocuments = action.payload.documents;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Update user in the list
        const index = state.users.findIndex(user => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        // Update selected user if it's the same
        if (state.selectedUser && state.selectedUser._id === action.payload.user._id) {
          state.selectedUser = action.payload.user;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload User Document
      .addCase(uploadUserDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadUserDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.userDocuments.unshift(action.payload.document);
      })
      .addCase(uploadUserDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Document Categories
      .addCase(fetchDocumentCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.documentCategories = action.payload;
      })
      .addCase(fetchDocumentCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Documents
      .addCase(fetchUserDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.userDocuments = action.payload;
      })
      .addCase(fetchUserDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Document deleted successfully';
        state.userDocuments = state.userDocuments.filter(doc => doc._id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch System Stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError, clearAdminSuccess, setSelectedUser, clearSelectedUser } = adminSlice.actions;

// Selectors
export const selectAdmin = (state) => state.admin;
export const selectAdminUsers = (state) => state.admin.users;
export const selectSelectedUser = (state) => state.admin.selectedUser;
export const selectUserDocuments = (state) => state.admin.userDocuments;
export const selectDocumentCategories = (state) => state.admin.documentCategories;
export const selectSystemStats = (state) => state.admin.systemStats;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminSuccess = (state) => state.admin.success;
export const selectAdminPagination = (state) => state.admin.pagination;

export default adminSlice.reducer; 