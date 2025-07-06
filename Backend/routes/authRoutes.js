const express = require('express');
const { 
    login, 
    logout, 
    addRoleBasedAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin,
    assignPermissions ,
    getDeactivationRequestedVendors,
    approveVendorDeactivation,
    rejectVendorDeactivation,
    approveReactivation,
    rejectReactivation
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');  // Corrected path

const router = express.Router();

// Public Route: Login
router.post('/login', login);

// Protected Route: Logout
router.post('/logout', verifyToken, logout);

// Protected Routes: Admin Management
router.post('/addRoleBasedAdmin', verifyToken, addRoleBasedAdmin);
router.get('/getAllAdmins', verifyToken, getAllAdmins);
router.put("/update-admin/:id", verifyToken, updateAdmin);
router.delete("/delete-admin/:id", verifyToken, deleteAdmin);
router.post("/assign-permissions", verifyToken, assignPermissions);

router.get(
    "/vendors/getVendors",
    verifyToken, // ensure only authenticated users (e.g., super admin) can access
    getDeactivationRequestedVendors
  );
  router.put(
    "/vendors/approveDeactivation/:id",
    verifyToken, // ensure only authenticated users (e.g., super admin) can access
    approveVendorDeactivation
  );

  router.put(
    "/vendors/reject-deactivation/:id",
    verifyToken,
    rejectVendorDeactivation
  );

  router.post("/vendors/approve-reactivation/:id", verifyToken, approveReactivation);
  router.post("/vendors/reject-reactivation/:id", verifyToken, rejectReactivation);

module.exports = router;
