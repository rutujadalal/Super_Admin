


import React, { useEffect, useState } from "react";

export const DashboardCards = () => {
  const [adminCount, setAdminCount] = useState(0);

  const fetchAdminCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/getAllAdmins", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAdminCount(data.admins.length);
      } else {
        console.error("Failed to fetch admin data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchAdminCount();
  }, []);

  const cards = [
    { title: "Total Revenue", value: "$124,563", increase: "+14%" },
    { title: "All Admins", value: `${adminCount}`, increase: "+7.2%" },
    { title: "Pending Bookings", value: "45", increase: "+2.5%" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-gray-500 text-sm">{card.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-semibold">{card.value}</span>
            <span className="text-green-500 text-sm">{card.increase}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
