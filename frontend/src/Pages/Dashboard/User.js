
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Sidebar } from "../Dashboard/Sidebar";
import { Header } from "../Dashboard/Header";
import { Pencil, Trash2 } from "lucide-react";

export const User = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" });
  const [formErrors, setFormErrors] = useState({});
  const [usersData, setUsersData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All");

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/getAllAdmins", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setUsersData(data.admins);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while fetching admins.", "error");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.role.trim()) {
      errors.role = "Role is required";
    }

    if (!editingUserId) {
      if (!formData.password.trim()) {
        errors.password = "Password is required";
      } else if (
        formData.password.length < 6 ||
        !/[a-z]/.test(formData.password) ||
        !/[A-Z]/.test(formData.password) ||
        !/\d/.test(formData.password)
      ) {
        errors.password = "Password must be at least 6 characters and include uppercase, lowercase, and a number";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const url = editingUserId
        ? `http://localhost:5000/api/auth/update-admin/${editingUserId}`
        : "http://localhost:5000/api/auth/addRoleBasedAdmin";

      const method = editingUserId ? "PUT" : "POST";
      const requestData = { ...formData };
      if (editingUserId && !requestData.password) {
        delete requestData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Success", editingUserId ? "Admin updated successfully!" : "Admin created successfully!", "success");
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "" });
        await fetchAdmins();
        setEditingUserId(null);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred. Please try again.", "error");
    }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setEditingUserId(user.id);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/delete-admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Deleted!", "Admin deleted successfully!", "success");
        setUsersData((prev) => prev.filter((user) => user.id !== id));
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred. Please try again.", "error");
    }
  };

  const filteredUsers = [...usersData]
    .reverse()
    .filter((user) => {
      if (selectedRole === "All") return true;
      return user.role === selectedRole.toLowerCase();
    });

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className={`flex flex-col w-full transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
          <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

          <div className="bg-gray-100 min-h-screen p-4">
            <div className="bg-white p-4 rounded-lg shadow-md w-full overflow-x-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h1 className="text-xl font-semibold mb-2 md:mb-0">Manage People</h1>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-700"
                  >
                    <option value="All">All</option>
                    <option value="Vendor">Vendor</option>
                    <option value="User">User</option>
                    <option value="Support">Support</option>
                  </select>
                  <button
                    className="border border-gray-300 rounded px-3 py-1 bg-blue-500 text-white text-sm"
                    onClick={() => {
                      setShowModal(true);
                      setEditingUserId(null);
                      setFormErrors({});
                      setFormData({ name: "", email: "", password: "", role: "" });
                    }}
                  >
                    Create
                  </button>
                </div>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-3 py-2 pl-6">S. No.</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id || index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 pl-6">{index + 1}</td>
                      <td className="px-3 py-2">{user.name}</td>
                      <td className="px-2 py-2">{user.email}</td>
                      <td className="px-2 py-2 capitalize">{user.role}</td>
                      <td className="px-3 py-2 text-right">
                        <button className="p-1.5 bg-yellow-500 text-white rounded m-1" onClick={() => handleEdit(user)}>
                          <Pencil size={16} />
                        </button>
                        <button className="p-1.5 bg-red-500 text-white rounded m-1" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">
                        No users found for selected role.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingUserId ? "Edit Admin" : "Create Admin"}</h2>

            <label className="block text-sm mb-1">Enter Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="w-full p-2 border rounded mb-1 bg-white"
            />
            {formErrors.name && <p className="text-red-500 text-xs mb-2">{formErrors.name}</p>}

            <label className="block text-sm mb-1">Enter Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded mb-1 bg-white"
            />
            {formErrors.email && <p className="text-red-500 text-xs mb-2">{formErrors.email}</p>}

            <label className="block text-sm mb-1">Enter Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={editingUserId ? "New Password (optional)" : "Password"}
              className="w-full p-2 border rounded mb-1 bg-white"
            />
            {formErrors.password && <p className="text-red-500 text-xs mb-2">{formErrors.password}</p>}

            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-2 bg-white"
            >
              <option value="">Select Role</option>
              <option value="vendor">Vendor</option>
              <option value="user">User</option>
              <option value="support">Support</option>
            </select>
            {formErrors.role && <p className="text-red-500 text-xs mb-2">{formErrors.role}</p>}

            <div className="flex justify-end space-x-2">
              <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                {editingUserId ? "Update" : "Create"}
              </button>
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default User;
