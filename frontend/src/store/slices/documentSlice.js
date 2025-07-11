import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async ({ category, financialYear }, { rejectWithValue }) => {
    try {
      const params = {};
      if (category) params.category = category;
      if (financialYear) params.financialYear = financialYear;

      const response = await api.get('/documents', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ userId, category, documentType, financialYear, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', userId);
      formData.append('category', category);
      formData.append('documentType', documentType);
      formData.append('financialYear', financialYear);

      const response = await api.post('/documents/upload', formData, {
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

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${documentId}`);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  documents: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch documents';
      })
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
        state.uploadProgress = 100;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to upload document';
        state.uploadProgress = 0;
      })
      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc._id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete document';
      });
  },
});

export const { clearDocumentError, setUploadProgress } = documentSlice.actions;

// Selectors
export const selectDocuments = (state) => state.documents.documents;
export const selectDocumentsLoading = (state) => state.documents.loading;
export const selectDocumentsError = (state) => state.documents.error;
export const selectUploadProgress = (state) => state.documents.uploadProgress;

export default documentSlice.reducer; 