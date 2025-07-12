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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentsIcon,
  Person as ProfileIcon,
  Receipt as BillingIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { logout, selectUser, selectIsAdmin } from '../store/slices/authSlice';

const drawerWidth = 240;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Documents', icon: <DocumentsIcon />, path: '/documents' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { text: 'Billing', icon: <BillingIcon />, path: '/billing' },
  ];

  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin' },
    { text: 'Users', icon: <ProfileIcon />, path: '/admin/users' },
    { text: 'Create Bill', icon: <BillingIcon />, path: '/admin/billing' },
    { text: 'All Bills', icon: <BillingIcon />, path: '/admin/all-bills' },
    { text: 'Statement', icon: <TrendingUpIcon />, path: '/admin/statement' },
  ];

  const getPageTitle = (path) => {
    const allItems = [...menuItems, ...adminMenuItems];
    const match = allItems.find(item => item.path === path);
    return match ? match.text : 'Client Portal';
  };

  const renderMenuItems = (items) => (
    items.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <ListItem
          button
          key={item.text}
          onClick={() => navigate(item.path)}
          sx={{
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'white' : 'inherit',
            fontWeight: isActive ? 600 : 'normal',
            borderLeft: isActive ? '4px solid #1976d2' : '4px solid transparent',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'white',
            },
            position: 'relative',
          }}
        >
          <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      );
    })
  );

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Client Portal
        </Typography>
      </Toolbar>
      <Divider />
      <List>{renderMenuItems(menuItems)}</List>
      {isAdmin && (
        <>
          <Divider />
          <List>{renderMenuItems(adminMenuItems)}</List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle(location.pathname)}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout}>Cancel</Button>
          <Button onClick={confirmLogout} color="primary">Logout</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainLayout;
