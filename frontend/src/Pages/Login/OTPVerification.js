// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";
// import axios from "axios";
// import backgroundImage from "../../Assets/Images/travel.jpg";

// const OTPVerification = () => {
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation()
//   const email = location.state?.email; 
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//         try {
//       const response = await axios.post(
//         "http://localhost:5000/api/admin/verifyotp",
//         { email, otp },
//         { withCredentials: true }  // ✅ Allows cookies to be sent/received
//       );
  
//       console.log(response.data);
      
//       if (response.data.message === "OTP verified successfully") {
//         localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ Store user details
//         document.cookie = `session_id=${response.data.session_id}; path=/`; // ✅ Store session ID in cookie
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
  
//     return (
     
//     <div className="flex justify-center items-center min-h-screen bg-cover bg-center"  style={{ backgroundImage: `url(${backgroundImage})` }}>
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
//         <h2 className="text-center text-2xl font-bold text-red-600 mb-4">
//           OTP VERIFICATION
//         </h2>
//         <p className="text-center text-gray-600 mb-4">
//           Enter the 6-digit OTP sent to your email.
//         </p>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             maxLength="6"
//             placeholder="Enter OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:border-blue-500"
//           />
//           {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//           <button
//             type="submit"
//             className="w-full bg-red-700 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-blue-900 transition duration-300"
//             disabled={loading}
//           >
//             {loading ? "Verifying..." : "Verify OTP"}
//           </button>
//         </form>
//         <p className="text-center text-gray-600 mt-4">
//           Didn't receive an OTP?{" "}
//           <span className="text-red-600 cursor-pointer">Resend</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default OTPVerification;
