import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { resetPassword, clearError, clearSuccess } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  const token = searchParams.get('token');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/login');
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setPendingValues(values);
      setConfirmDialogOpen(true);
    },
  });

  const handleConfirmReset = async () => {
    setConfirmDialogOpen(false);
    dispatch(clearError());
    dispatch(clearSuccess());
    if (pendingValues) {
      await dispatch(resetPassword({
        token,
        password: pendingValues.password,
      }));
    }
  };

  const handleCancelReset = () => {
    setConfirmDialogOpen(false);
    setPendingValues(null);
  };

  if (!token) {
    return (
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
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error">
              Invalid or expired reset token. Please request a new password reset.
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/forgot-password')}
              sx={{ mt: 2 }}
            >
              Request Password Reset
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
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
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Reset Password
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Enter your new password
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
            <TextField
              fullWidth
              id="password"
              name="password"
              label="New Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              Remember your password?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
            </Typography>
          </form>
        </CardContent>
      </Card>
      <Dialog open={confirmDialogOpen} onClose={handleCancelReset}>
        <DialogTitle>Confirm Password Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset your password?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReset}>Cancel</Button>
          <Button onClick={handleConfirmReset} color="primary">Reset Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResetPassword; 