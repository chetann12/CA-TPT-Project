import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  fetchUsers,
  fetchUserDetails,
  updateUserStatus,
  uploadUserDocument,
  fetchDocumentCategories,
  fetchUserDocuments,
  deleteDocument,
  clearAdminError,
  clearAdminSuccess,
  selectAdminUsers,
  selectSelectedUser,
  selectUserDocuments,
  selectDocumentCategories,
  selectAdminLoading,
  selectAdminError,
  selectAdminSuccess,
  selectAdminPagination,
} from '../../store/slices/adminSlice';

const validationSchema = Yup.object({
  category: Yup.string().required('Category is required'),
  documentType: Yup.string().required('Document type is required'),
  financialYear: Yup.string().required('Financial year is required'),
  description: Yup.string(),
});

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const selectedUser = useSelector(selectSelectedUser);
  const userDocuments = useSelector(selectUserDocuments);
  const documentCategories = useSelector(selectDocumentCategories);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const success = useSelector(selectAdminSuccess);
  const pagination = useSelector(selectAdminPagination);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  // Add state for selected document year
  const [selectedDocYear, setSelectedDocYear] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page: page + 1, limit: rowsPerPage, search, status: statusFilter }));
    dispatch(fetchDocumentCategories());
  }, [dispatch, page, rowsPerPage, search, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewUser = async (userId) => {
    setSelectedUserId(userId);
    await dispatch(fetchUserDetails(userId));
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (userId, isActive) => {
    await dispatch(updateUserStatus({ userId, isActive }));
  };

  const handleUploadDocument = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append('document', values.file);
    formData.append('category', values.category);
    formData.append('documentType', values.documentType);
    formData.append('financialYear', values.financialYear);
    formData.append('description', values.description || '');

    await dispatch(uploadUserDocument({ userId: selectedUserId, formData }));
    resetForm();
    setUploadDialogOpen(false);
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dispatch(deleteDocument(documentId));
    }
  };

  const uploadFormik = useFormik({
    initialValues: {
      file: null,
      category: '',
      documentType: '',
      financialYear: '',
      description: '',
    },
    validationSchema,
    onSubmit: handleUploadDocument,
  });

  const getUserName = (user) => {
    if (user.userType === 'individual') {
      return `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();
    }
    return user.companyName || 'N/A';
  };

  const getDocumentTypeOptions = () => {
    if (!selectedCategory || !documentCategories[selectedCategory]) return [];
    return documentCategories[selectedCategory].types || [];
  };

  const financialYears = [
    '2024-25', '2023-24', '2022-23', '2021-22', '2020-21',
    '2019-20', '2018-19', '2017-18', '2016-17', '2015-16'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminSuccess())}>
          {success}
        </Alert>
      )}

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>PAN</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>User Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{getUserName(user)}</TableCell>
                  <TableCell>{user.pan}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.userType === 'individual' ? 'Individual/HUF' : 'Company/LLP'}
                      color={user.userType === 'individual' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewUser(user._id)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setUploadDialogOpen(true);
                      }}
                      title="Upload Document"
                    >
                      <UploadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* View User Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#f7f9fa', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6" component="span">User Details</Typography>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)} size="large">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedUser && (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'inherit' }}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" gutterBottom>Basic Information</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Name"
                            secondary={getUserName(selectedUser)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="PAN"
                            secondary={selectedUser.pan}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Email"
                            secondary={selectedUser.email}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Mobile"
                            secondary={selectedUser.mobile}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="User Type"
                            secondary={selectedUser.userType === 'individual' ? 'Individual/HUF' : 'Company/LLP'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Registration Date"
                            secondary={new Date(selectedUser.createdAt).toLocaleDateString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Last Login"
                            secondary={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Account Status */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BankIcon color="secondary" />
                        <Typography variant="h6" gutterBottom>Account Status</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedUser.isActive}
                            onChange={(e) => handleStatusChange(selectedUser._id, e.target.checked)}
                          />
                        }
                        label={selectedUser.isActive ? 'Active' : 'Inactive'}
                      />
                      {selectedUser.deactivationReason && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Reason: {selectedUser.deactivationReason}
                        </Typography>
                      )}
                      {selectedUser.loginAttempts > 0 && (
                        <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                          Failed Login Attempts: {selectedUser.loginAttempts}
                        </Typography>
                      )}
                      {selectedUser.lockUntil && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Account Locked Until: {new Date(selectedUser.lockUntil).toLocaleString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                {/* Individual/HUF Details */}
                {selectedUser.userType === 'individual' && (
                  <Grid item xs={12}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon color="primary" />
                          <Typography variant="h6" gutterBottom>Individual/HUF Details</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="First Name"
                                  secondary={selectedUser.firstName || 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Middle Name"
                                  secondary={selectedUser.middleName || 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Last Name"
                                  secondary={selectedUser.lastName || 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Trade Name"
                                  secondary={selectedUser.tradeName || 'N/A'}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="Father's Name"
                                  secondary={`${selectedUser.fatherFirstName || ''} ${selectedUser.fatherMiddleName || ''} ${selectedUser.fatherLastName || ''}`.trim() || 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Date of Birth"
                                  secondary={selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="GST Number"
                                  secondary={selectedUser.gstNumber || 'N/A'}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Address
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedUser.address || 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {/* Company/LLP Details */}
                {selectedUser.userType === 'company' && (
                  <Grid item xs={12}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <BusinessIcon color="secondary" />
                          <Typography variant="h6" gutterBottom>Company/LLP Details</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="Company Name"
                                  secondary={selectedUser.companyName || 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Date of Incorporation"
                                  secondary={selectedUser.dateOfIncorporation ? new Date(selectedUser.dateOfIncorporation).toLocaleDateString() : 'N/A'}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Company Address
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedUser.companyAddress || 'N/A'}
                            </Typography>
                          </Grid>
                          {selectedUser.directorDetails && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom>
                                Director Details
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2">
                                    <strong>Name:</strong> {selectedUser.directorDetails.name || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2">
                                    <strong>PAN:</strong> {selectedUser.directorDetails.pan || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2">
                                    <strong>Aadhaar:</strong> {selectedUser.directorDetails.aadhar || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="body2">
                                    <strong>DIN:</strong> {selectedUser.directorDetails.din || 'N/A'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {/* Documents Section */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DescriptionIcon color="action" />
                        <Typography variant="h6" gutterBottom>Documents ({userDocuments.length})</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <InputLabel>Financial Year</InputLabel>
                          <Select
                            value={selectedDocYear}
                            label="Financial Year"
                            onChange={e => setSelectedDocYear(e.target.value)}
                          >
                            <MenuItem value="">All</MenuItem>
                            {financialYears.map(year => (
                              <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Document Type</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell>Financial Year</TableCell>
                              <TableCell>Upload Date</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(selectedDocYear
                              ? userDocuments.filter(doc => doc.financialYear === selectedDocYear)
                              : userDocuments
                            ).map((doc) => (
                              <TableRow key={doc._id}>
                                <TableCell>{doc.documentType}</TableCell>
                                <TableCell>{doc.category}</TableCell>
                                <TableCell>{doc.financialYear}</TableCell>
                                <TableCell>
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteDocument(doc._id)}
                                    title="Delete Document"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained" color="primary" size="large">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <form onSubmit={uploadFormik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>

              {/* add here */}

               <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Financial Year</InputLabel>
                  <Select
                    name="financialYear"
                    value={uploadFormik.values.financialYear}
                    onChange={uploadFormik.handleChange}
                    error={uploadFormik.touched.financialYear && Boolean(uploadFormik.errors.financialYear)}
                  >
                    {financialYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={uploadFormik.values.category}
                    onChange={(e) => {
                      uploadFormik.setFieldValue('category', e.target.value);
                      setSelectedCategory(e.target.value);
                      uploadFormik.setFieldValue('documentType', '');
                    }}
                    error={uploadFormik.touched.category && Boolean(uploadFormik.errors.category)}
                  >
                    {Object.keys(documentCategories).map((key) => (
                      <MenuItem key={key} value={key}>
                        {documentCategories[key].name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    name="documentType"
                    value={uploadFormik.values.documentType}
                    onChange={uploadFormik.handleChange}
                    error={uploadFormik.touched.documentType && Boolean(uploadFormik.errors.documentType)}
                  >
                    {getDocumentTypeOptions().map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
             
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description (Optional)"
                  value={uploadFormik.values.description}
                  onChange={uploadFormik.handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <input
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={(event) => {
                    uploadFormik.setFieldValue('file', event.currentTarget.files[0]);
                  }}
                />
                <label htmlFor="file-upload">
                  <Button variant="outlined" component="span" fullWidth>
                    Choose File
                  </Button>
                </label>
                {uploadFormik.values.file && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {uploadFormik.values.file.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !uploadFormik.values.file}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 