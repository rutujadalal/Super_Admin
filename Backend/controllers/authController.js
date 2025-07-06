const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const SuperAdminModel = require("../models/superAdminModel");
const { verifyToken } = require("../middleware/authMiddleware"); // Import the middleware
const { sendEmail } = require("../services/mailServices");
require("dotenv").config();

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await SuperAdminModel.findByEmail(email);
    if (!admin)
      return res.status(404).json({ message: "Super Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  try {
    res.clearCookie("token"); // Clear token if stored in cookies
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add Role-Based Admin

exports.addRoleBasedAdmin = [
  verifyToken,
  async (req, res) => {
    const { name, email, password, permissions, role } = req.body;
    const allowedRoles = ["admin", "vendor", "support", "user"];

    try {
      // ✅ Super admin check
      if (req.user.role !== "super_admin") {
        return res.status(403).json({
          message: "Unauthorized: Only Super Admins can add sub-admins",
        });
      }

      // ✅ Validate input
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }

      // ✅ Check if user already exists
      const existingUser = await pool.query(
        "SELECT * FROM admins WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert into DB
      const newUser = await pool.query(
        `INSERT INTO admins (name, email, password, permissions, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
        [name, email, hashedPassword, JSON.stringify(permissions || {}), role]
      );

      // ✅ Send email with credentials
      await sendEmail(email, password, "Your Admin Account Details");

      // ✅ Respond with success
      res.status(201).json({
        message: `${role} added successfully`,
        user: newUser.rows[0],
      });
    } catch (error) {
      console.error("Error adding admin:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// Get All Admins
exports.getAllAdmins = [
  verifyToken, // Middleware to verify token
  async (req, res) => {
    try {
      if (req.user.role !== "super_admin") {
        return res
          .status(403)
          .json({ message: "Unauthorized: Only Super Admins can view admins" });
      }

      // Fetch admins along with their hashed passwords (⚠️ Ensure these are never exposed in frontend)
      const result = await pool.query(
        "SELECT id, name, email, role, permissions, password FROM admins"
      );
      const admins = result.rows;

      res.status(200).json({ message: "Admins fetched successfully", admins });
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// Update Admin

exports.updateAdmin = [
  verifyToken,
  async (req, res) => {
    const { id } = req.params;
    const { name, email, permissions, role, password } = req.body;

    try {
      if (req.user.role !== "super_admin") {
        return res.status(403).json({
          message: "Unauthorized: Only Super Admins can update admins",
        });
      }

      // ✅ Check if admin exists
      const adminExists = await pool.query(
        "SELECT id FROM admins WHERE id = $1",
        [id]
      );

      if (adminExists.rows.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      let hashedPassword = null;

      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      // ✅ Prepare the update query dynamically
      const query = `
        UPDATE admins 
        SET name = $1, email = $2, permissions = $3, role = $4
        ${password ? ", password = $5" : ""}
        , updated_at = NOW()
        WHERE id = $6
        RETURNING id, name, email, role, permissions`;

      const values = password
        ? [
            name,
            email,
            permissions ? JSON.stringify(permissions) : null,
            role,
            hashedPassword,
            id,
          ]
        : [
            name,
            email,
            permissions ? JSON.stringify(permissions) : null,
            role,
            id,
          ];

      const updatedAdmin = await pool.query(query, values);

      // ✅ If password was updated, send updated credentials via email
      if (password) {
        await sendEmail(email, password, "Your Updated Admin Credentials");
      }

      res.status(200).json({
        message: "Admin updated successfully",
        admin: updatedAdmin.rows[0],
      });
    } catch (error) {
      console.error("Error updating admin:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// Delete Admin

exports.deleteAdmin = [
  verifyToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      if (req.user.role !== "super_admin") {
        return res.status(403).json({
          message: "Unauthorized: Only Super Admins can delete admins",
        });
      }

      // Check if admin exists
      const adminExists = await pool.query(
        "SELECT id FROM admins WHERE id = $1",
        [id]
      );
      if (adminExists.rows.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Delete admin
      await pool.query("DELETE FROM admins WHERE id = $1", [id]);

      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// .................................Reset Vendor Status..............................................//

exports.resetVendorStatus = async (req, res) => {
  const vendorId = req.params.id;
  const adminId = req.user.id;

  try {
    // Reset the vendor's status
    await pool.query(
      `UPDATE vendors 
         SET 
           deactivation_status = 'active', 
           is_active = true, 
           deactivation_requested_by = NULL, 
           deactivation_requested_at = NULL, 
           deactivation_resolved_by = $1, 
           deactivation_resolved_at = NOW() 
         WHERE id = $2`,
      [adminId, vendorId]
    );

    res.status(200).json({ message: "Vendor status reset successfully." });
  } catch (error) {
    console.error("Reset Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getDeactivationRequestedVendors = [
  verifyToken,
  async (req, res) => {
    try {
      if (req.user.role !== "super_admin") {
        return res.status(403).json({
          message:
            "Unauthorized: Only super admins can view deactivation/reactivation requests",
        });
      }

      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          company_name, 
          contact_number, 
          email, 
          deactivation_status, 
          is_active,
          deactivation_requested_by
        FROM vendors
        WHERE 
          deactivation_status IN ('pending_deactivation', 'pending_activation')
          AND deactivation_requested_by IS NOT NULL
      `);

      const allRequests = result.rows;

      const deactivationRequests = allRequests.filter(
        (vendor) => vendor.deactivation_status === "pending_deactivation"
      );
      const reactivationRequests = allRequests.filter(
        (vendor) => vendor.deactivation_status === "pending_activation"
      );

      res.status(200).json({
        message: "Deactivation and reactivation requests fetched successfully",
        deactivationRequests,
        reactivationRequests,
      });
    } catch (error) {
      console.error("Error fetching vendor requests:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// Assign Permissions
exports.assignPermissions = [
  verifyToken,
  async (req, res) => {
    const { adminId, permissions } = req.body;

    try {
      if (req.user.role !== "super_admin") {
        return res.status(403).json({
          message: "Unauthorized: Only Super Admins can assign permissions",
        });
      }

      await pool.query("UPDATE admins SET permissions = $1 WHERE id = $2", [
        JSON.stringify(permissions),
        adminId,
      ]);

      res.status(200).json({ message: "Permissions updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

exports.approveVendorDeactivation = async (req, res) => {
  try {
    const vendorId = req.params.id;

    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE vendors
       SET deactivation_status = 'deactivated',
           is_active = false,
           updated_at = NOW(),
           deactivation_resolved_by = $2,
           deactivation_resolved_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [vendorId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res
      .status(200)
      .json({
        message: "Vendor deactivation approved successfully",
        vendor: result.rows[0],
      });
  } catch (error) {
    console.error("Error approving deactivation:", error);
    res
      .status(500)
      .json({ message: "Server error while approving deactivation" });
  }
};

exports.rejectVendorDeactivation = async (req, res) => {
  try {
    const vendorId = req.params.id;

    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE vendors
       SET deactivation_status = 'active',
           updated_at = NOW(),
           deactivation_resolved_by = $2,
           deactivation_resolved_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [vendorId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res
      .status(200)
      .json({
        message: "Vendor deactivation request rejected successfully",
        vendor: result.rows[0],
      });
  } catch (error) {
    console.error("Error rejecting deactivation:", error);
    res
      .status(500)
      .json({ message: "Server error while rejecting deactivation" });
  }
};

exports.approveReactivation = async (req, res) => {
  const vendorId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE vendors 
       SET is_active = true,
           deactivation_status = 'activated',
           updated_at = NOW(),
           deactivation_resolved_by = $2,
           deactivation_resolved_at = NOW()
       WHERE id = $1 AND deactivation_status = 'pending_activation'
       RETURNING *`,
      [vendorId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Vendor not found or no reactivation requested" });
    }

    res
      .status(200)
      .json({
        message: "Vendor reactivated successfully",
        vendor: result.rows[0],
      });
  } catch (error) {
    console.error("Error approving reactivation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.rejectReactivation = async (req, res) => {
  const vendorId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE vendors 
       SET deactivation_status = 'deactivated',
           updated_at = NOW(),
           deactivation_resolved_by = $2,
           deactivation_resolved_at = NOW()
       WHERE id = $1 AND deactivation_status = 'pending_activation'
       RETURNING *`,
      [vendorId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Vendor not found or no reactivation requested" });
    }

    res
      .status(200)
      .json({
        message: "Reactivation request rejected",
        vendor: result.rows[0],
      });
  } catch (error) {
    console.error("Error rejecting reactivation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
