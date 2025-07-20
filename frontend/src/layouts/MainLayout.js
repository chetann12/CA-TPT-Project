import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentsIcon,
  Person as ProfileIcon,
  Receipt as BillingIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import { logout, selectUser, selectIsAdmin } from '../store/slices/authSlice';
import Logo from '../assets/LogoPlaceholder.svg';

const NAVY = '#1A237E';

const menuItems = [
  { text: 'Home', icon: <DashboardIcon fontSize="small" />, path: '/' },
  { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { text: 'Documents', icon: <DocumentsIcon fontSize="small" />, path: '/documents' },
  { text: 'Profile', icon: <ProfileIcon fontSize="small" />, path: '/profile' },
  { text: 'Billing', icon: <BillingIcon fontSize="small" />, path: '/billing' },
];

const adminMenuItems = [
  { text: 'Admin Dashboard', icon: <AdminIcon fontSize="small" />, path: '/admin' },
  { text: 'Users', icon: <ProfileIcon fontSize="small" />, path: '/admin/users' },
  { text: 'Create Bill', icon: <BillingIcon fontSize="small" />, path: '/admin/billing' },
  { text: 'All Bills', icon: <BillingIcon fontSize="small" />, path: '/admin/all-bills' },
  { text: 'Statement', icon: <TrendingUpIcon fontSize="small" />, path: '/admin/statement' },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f9fb' }}>
      <AppBar position="static" sx={{ bgcolor: NAVY, color: '#fff', boxShadow: '0 2px 8px rgba(26,35,126,0.06)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, cursor: 'pointer' }} onClick={() => navigate('/') }>
            <img src={Logo} alt="CA TPT & Associates Logo" style={{ height: 36, marginRight: 12 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
              CA TPT & Associates
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
            {(isAdmin ? adminMenuItems : menuItems).map(item => (
              <Button
                key={item.text}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderRadius: 2,
                  px: 2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Stack>
          {user && (
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600, mr: 2 }}>
              Welcome, {user.name}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ color: '#fff', fontWeight: 600 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
       <Container maxWidth="lg">
    <Outlet />
  </Container>
    </Box>
  );
};

export default MainLayout;
