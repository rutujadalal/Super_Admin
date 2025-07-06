
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Sidebar } from "../Dashboard/Sidebar";
import { Header } from "../Dashboard/Header";

export const Vendor = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [vendors, setVendors] = useState([]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/vendors/getVendors", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        const combined = [
          ...data.deactivationRequests.map(v => ({ ...v, requestType: "deactivation" })),
          ...data.reactivationRequests.map(v => ({ ...v, requestType: "reactivation" })),
        ];
        setVendors(combined);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while fetching vendors.", "error");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproveDeactivation = async (id) => {
    const confirm = await Swal.fire({
      title: "Approve Deactivation?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/vendors/approveDeactivation/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Approved", "Deactivation approved!", "success");
        fetchVendors();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "Approval failed.", "error");
    }
  };

  const handleRejectDeactivation = async (id) => {
    const confirm = await Swal.fire({
      title: "Reject Deactivation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/vendors/reject-deactivation/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Rejected", "Deactivation request rejected!", "success");
        fetchVendors();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "Rejection failed.", "error");
    }
  };

  const handleApproveReactivation = async (id) => {
    const confirm = await Swal.fire({
      title: "Approve Reactivation?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/vendors/approve-reactivation/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Approved", "Reactivation approved!", "success");
        fetchVendors();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "Approval failed.", "error");
    }
  };

  const handleRejectReactivation = async (id) => {
    const confirm = await Swal.fire({
      title: "Reject Reactivation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/vendors/reject-reactivation/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Rejected", "Reactivation request rejected!", "success");
        fetchVendors();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "Rejection failed.", "error");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex flex-col w-full transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="p-6 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md w-full overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
            {vendors.length > 0 ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-3 py-2 pl-6">S. No.</th>
                    <th className="px-3 py-2">Vendor Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Request Type</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, index) => (
                    <tr key={vendor.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 pl-6">{index + 1}</td>
                      <td className="px-3 py-2">{vendor.name}</td>
                      <td className="px-3 py-2">{vendor.email}</td>
                      <td className="px-3 py-2 capitalize">{vendor.requestType}</td>
                      <td className="px-3 py-2 text-right space-x-2">
                        {vendor.requestType === "deactivation" ? (
                          <>
                            <button
                              onClick={() => handleApproveDeactivation(vendor.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectDeactivation(vendor.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApproveReactivation(vendor.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectReactivation(vendor.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No pending requests at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
