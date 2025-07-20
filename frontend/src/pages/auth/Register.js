import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { register, clearError, clearSuccess } from '../../store/slices/authSlice';
import FirmHeader from '../../components/FirmHeader';
import FirmFooter from '../../components/FirmFooter';

const validationSchema = Yup.object().shape({
  userType: Yup.string().required('User type is required'),
  // Common fields
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  pan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .required('PAN is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  // Individual/HUF specific fields
  firstName: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('First name is required'),
  }),
  middleName: Yup.string(),
  lastName: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('Last name is required'),
  }),
  tradeName: Yup.string(),
  fatherFirstName: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('Father\'s first name is required'),
  }),
  fatherMiddleName: Yup.string(),
  fatherLastName: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('Father\'s last name is required'),
  }),
  address: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('Address is required'),
  }),
  dateOfBirth: Yup.date().when('userType', {
    is: 'individual',
    then: () =>
      Yup.date()
        .required('Date of birth is required')
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'You must be at least 18 years old'),
  }),
  gstNumber: Yup.string(),
  aadharNumber: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhar number must be 12 digits')
    .when('userType', {
      is: 'individual',
      then: () => Yup.string().required('Aadhar number is required'),
    }),
  bankName: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('Bank name is required'),
  }),
  accountNumber: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('Account number is required'),
  }),
  ifscCode: Yup.string().when('userType', {
    is: 'individual',
    then: () => Yup.string().required('IFSC code is required'),
  }),
  // Company/LLP/Partnership specific fields
  companyName: Yup.string().when('userType', {
    is: 'company',
    then: () => Yup.string().required('Company name is required'),
  }),
  companyAddress: Yup.string().when('userType', {
    is: 'company',
    then: () => Yup.string().required('Company address is required'),
  }),
  dateOfIncorporation: Yup.date().when('userType', {
    is: 'company',
    then: () => Yup.date().required('Date of incorporation is required'),
  }),
  directorName: Yup.string().when('userType', {
    is: 'company',
    then: () => Yup.string().required('Director name is required'),
  }),
  directorPan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .when('userType', {
      is: 'company',
      then: () => Yup.string().required('Director PAN is required'),
    }),
  directorAadhar: Yup.string()
    .matches(/^[0-9]{12}$/, 'Aadhar number must be 12 digits')
    .when('userType', {
      is: 'company',
      then: () => Yup.string().required('Director Aadhar is required'),
    }),
  directorDin: Yup.string().when('userType', {
    is: 'company',
    then: () => Yup.string().required('Director DIN is required'),
  }),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  const [userType, setUserType] = useState('individual');

  useEffect(() => {
    if (success) {
      navigate('/login');
    }
  }, [success, navigate]);

  const formik = useFormik({
    initialValues: {
      userType: 'individual',
      // Common fields
      email: '',
      mobile: '',
      pan: '',
      password: '',
      confirmPassword: '',
      // Individual/HUF specific fields
      firstName: '',
      middleName: '',
      lastName: '',
      tradeName: '',
      fatherFirstName: '',
      fatherMiddleName: '',
      fatherLastName: '',
      address: '',
      dateOfBirth: '',
      gstNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      // Company/LLP/Partnership specific fields
      companyName: '',
      companyAddress: '',
      dateOfIncorporation: '',
      directorName: '',
      directorPan: '',
      directorAadhar: '',
      directorDin: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      dispatch(clearError());
      dispatch(clearSuccess());
      await dispatch(register(values));
    },
  });

  const handleUserTypeChange = (event) => {
    setUserType(event.target.value);
    formik.setFieldValue('userType', event.target.value);
  };

  const renderIndividualFields = () => (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
         <Typography variant="h12" gutterBottom>
          as per PAN Card
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="firstName"
          name="firstName"
          label="First Name"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="middleName"
          name="middleName"
          label="Middle Name"
          value={formik.values.middleName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.middleName && Boolean(formik.errors.middleName)}
          helperText={formik.touched.middleName && formik.errors.middleName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="lastName"
          name="lastName"
          label="Last Name"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="tradeName"
          name="tradeName"
          label="Trade Name (If Any)"
          value={formik.values.tradeName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.tradeName && Boolean(formik.errors.tradeName)}
          helperText={formik.touched.tradeName && formik.errors.tradeName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Father's Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="fatherFirstName"
          name="fatherFirstName"
          label="Father's First Name"
          value={formik.values.fatherFirstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fatherFirstName && Boolean(formik.errors.fatherFirstName)}
          helperText={formik.touched.fatherFirstName && formik.errors.fatherFirstName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="fatherMiddleName"
          name="fatherMiddleName"
          label="Father's Middle Name"
          value={formik.values.fatherMiddleName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fatherMiddleName && Boolean(formik.errors.fatherMiddleName)}
          helperText={formik.touched.fatherMiddleName && formik.errors.fatherMiddleName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          id="fatherLastName"
          name="fatherLastName"
          label="Father's Last Name"
          value={formik.values.fatherLastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fatherLastName && Boolean(formik.errors.fatherLastName)}
          helperText={formik.touched.fatherLastName && formik.errors.fatherLastName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="address"
          name="address"
          label="Address"
          multiline
          rows={4}
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.address && Boolean(formik.errors.address)}
          helperText={formik.touched.address && formik.errors.address}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="dateOfBirth"
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formik.values.dateOfBirth}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
          helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0] }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="gstNumber"
          name="gstNumber"
          label="GST Number (If Applicable)"
          value={formik.values.gstNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.gstNumber && Boolean(formik.errors.gstNumber)}
          helperText={formik.touched.gstNumber && formik.errors.gstNumber}
          disabled={loading}
        />
      </Grid>
    </>
  );

  const renderCompanyFields = () => (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Company Information
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="companyName"
          name="companyName"
          label="Company Name"
          value={formik.values.companyName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.companyName && Boolean(formik.errors.companyName)}
          helperText={formik.touched.companyName && formik.errors.companyName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="companyAddress"
          name="companyAddress"
          label="Company Address"
          multiline
          rows={4}
          value={formik.values.companyAddress}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.companyAddress && Boolean(formik.errors.companyAddress)}
          helperText={formik.touched.companyAddress && formik.errors.companyAddress}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="dateOfIncorporation"
          name="dateOfIncorporation"
          label="Date of Incorporation"
          type="date"
          value={formik.values.dateOfIncorporation}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.dateOfIncorporation && Boolean(formik.errors.dateOfIncorporation)}
          helperText={formik.touched.dateOfIncorporation && formik.errors.dateOfIncorporation}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Director Information
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="directorName"
          name="directorName"
          label="Director Name"
          value={formik.values.directorName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.directorName && Boolean(formik.errors.directorName)}
          helperText={formik.touched.directorName && formik.errors.directorName}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="directorPan"
          name="directorPan"
          label="Director PAN"
          value={formik.values.directorPan}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.directorPan && Boolean(formik.errors.directorPan)}
          helperText={formik.touched.directorPan && formik.errors.directorPan}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          id="directorAadhar"
          name="directorAadhar"
          label="Director Aadhar"
          value={formik.values.directorAadhar}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.directorAadhar && Boolean(formik.errors.directorAadhar)}
          helperText={formik.touched.directorAadhar && formik.errors.directorAadhar}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="directorDin"
          name="directorDin"
          label="Director DIN"
          value={formik.values.directorDin}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.directorDin && Boolean(formik.errors.directorDin)}
          helperText={formik.touched.directorDin && formik.errors.directorDin}
          disabled={loading}
        />
      </Grid>
    </>
  );

  return (
    <>
      <FirmHeader />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 800, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Register
            </Typography>
            <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
              Create your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.userType && Boolean(formik.errors.userType)}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      id="userType"
                      name="userType"
                      value={userType}
                      onChange={handleUserTypeChange}
                      label="User Type"
                      disabled={loading}
                    >
                      <MenuItem value="individual">Individual / HUF</MenuItem>
                      <MenuItem value="company">Company / LLP / Partnership Firm</MenuItem>
                    </Select>
                    {formik.touched.userType && formik.errors.userType && (
                      <FormHelperText>{formik.errors.userType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Common Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="mobile"
                    name="mobile"
                    label="Mobile Number"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                    helperText={formik.touched.mobile && formik.errors.mobile}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="pan"
                    name="pan"
                    label="PAN"
                    value={formik.values.pan}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.pan && Boolean(formik.errors.pan)}
                    helperText={formik.touched.pan && formik.errors.pan}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    disabled={loading}
                  />
                </Grid>

                {/* Conditional Fields */}
                {userType === 'individual' ? renderIndividualFields() : renderCompanyFields()}

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Already have an account?{' '}
                    <Button
                      color="primary"
                      onClick={() => navigate('/login')}
                      sx={{ textTransform: 'none' }}
                    >
                      Login
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
      <FirmFooter />
    </>
  );
};

export default Register; 