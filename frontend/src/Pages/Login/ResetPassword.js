// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import multiflyLogo from "../../Assets/Images/Multiflylogo.png";
// import backgroundVideo from "../../Assets/Images/vido.mp4";

// export const ResetPassword = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const email = location.state?.email || "";

//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleResetPassword = async () => {
//     if (!email || !otp || !newPassword || !confirmPassword) {
//       setError("All fields are required");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }
    
//     setError("");
//     setLoading(true);
//     try {
//       const response = await axios.post("http://localhost:5000/api/admin/resetpassword", {
//         email,
//         otp,
//         new_password: newPassword,
//       });

//       setMessage(response.data.message);
//       setTimeout(() => navigate("/login"), 2000); // Redirect to login after success
//     } catch (error) {
//       console.error("Reset Password Error:", error.response?.data || error.message);
//       setError(error.response?.data?.message || "Failed to reset password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
//       <video
//         src={backgroundVideo}
//         autoPlay
//         loop
//         muted
//         playsInline
//         className="absolute top-0 left-0 w-full h-full object-cover"
//       />
//       <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
//       <div className="relative w-full max-w-md p-8 space-y-6 bg-white shadow-2xl rounded-2xl border-2 border-blue-900 bg-opacity-90 z-10">
//         <div className="text-center mb-6">
//           <img src={multiflyLogo} alt="logo" className="w-40 mx-auto" />
//         </div>
//         <h2 className="text-2xl font-bold text-center text-red-700 uppercase">Reset Password</h2>
//         {error && <p className="text-red-600 text-center font-semibold">{error}</p>}
//         {message && <p className="text-green-600 text-center font-semibold">{message}</p>}
        
//         <label className="block text-blue-900 font-bold">OTP</label>
//         <input
//           type="text"
//           className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           placeholder="Enter OTP"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//         />
//         <label className="block text-blue-900 font-bold mt-4">New Password</label>
//         <input
//           type="password"
//           className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           placeholder="Enter new password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//         />
//         <label className="block text-blue-900 font-bold mt-4">Confirm Password</label>
//         <input
//           type="password"
//           className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           placeholder="Confirm new password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//         />
//         <button
//           onClick={handleResetPassword}
//           className="w-full px-6 py-3 mt-4 text-lg font-bold text-white bg-blue-900 rounded-lg hover:bg-red-700 transition duration-300"
//           disabled={loading}
//         >
//           {loading ? "Resetting..." : "Reset Password"}
//         </button>
//       </div>
//     </div>
//   );
// };
