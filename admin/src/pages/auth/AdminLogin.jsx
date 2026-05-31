import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLogin() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            // Try admin-specific endpoint first, fallback to regular login if needed
            const res = await axios.post("/api/auths/admin/login", formData, { withCredentials: true });

            const { message, user, accessToken } = res.data;
            const saveUser = {
                FullName: user.FullName,
                Email: user.Email,
                Role: user.Role || 'admin'
            }

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem("adminUser", JSON.stringify(saveUser));
            // Also save as user for compatibility if needed
            localStorage.setItem("user", JSON.stringify(saveUser));

            toast.success(message || "Admin login successful.");
            setTimeout(() => navigate("/admin/dashboard"), 1500);

        } catch (err) {
            const errMsg = err.response?.data?.message || "Incorrect email or password. Please try again.";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                theme="colored"
            />
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4 py-10 transition-colors">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-blue-50 dark:bg-gray-700 rounded-full">
                        <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-cyan-400">
                            admin_panel_settings
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Sign in to access the admin dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-colors"
                            placeholder="Enter admin email"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 transition-colors"
                            placeholder="Enter password"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600" />
                            <span>Remember Me</span>
                        </label>
                        <a href="#" className="text-blue-600 dark:text-cyan-400 hover:underline transition">
                            Forgot password?
                        </a>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50 mt-4" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
                    Need help? Contact system administrator
                </p>
            </div>
        </div>
        </>
    );
}

