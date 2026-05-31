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
            // Standard auth endpoint
            const res = await axios.post("/api/auth/login", formData, { withCredentials: true });

            const { message } = res.data;
            const { user, tokens } = res.data.data;
            const accessToken = tokens.access.token;
            
            // Check if user is admin
            if (user.role !== 'admin') {
                toast.error("You do not have admin privileges.");
                setLoading(false);
                return;
            }

            const saveUser = {
                FullName: user.full_name || 'Admin',
                Email: user.email,
                Role: user.role
            };

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
            <div className="bg-gradient-to-br from-[#7FFFD4]/20 to-[#FF6B6B]/20 dark:from-[#7FFFD4]/10 dark:to-[#FF6B6B]/10 min-h-screen flex items-center justify-center px-4 py-10 transition-colors">
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-gray-700 w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-r from-[#7FFFD4]/20 to-[#FF6B6B]/20 rounded-full">
                        <span className="material-symbols-outlined text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#7FFFD4] to-[#FF6B6B]">
                            admin_panel_settings
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7FFFD4] to-[#FF6B6B] bg-clip-text text-transparent mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Sign in to access the admin dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7FFFD4] text-gray-900 dark:text-gray-100 transition-all shadow-sm"
                            placeholder="Enter admin email"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] text-gray-900 dark:text-gray-100 transition-all shadow-sm"
                            placeholder="Enter password"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="rounded border-gray-300 text-[#7FFFD4] focus:ring-[#7FFFD4] bg-white dark:bg-gray-700 dark:border-gray-600 w-4 h-4 cursor-pointer" />
                            <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">Remember Me</span>
                        </label>
                        <a href="#" className="text-gray-500 hover:text-[#FF6B6B] transition-colors font-medium">
                            Forgot password?
                        </a>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-[#7FFFD4] to-[#FF6B6B] hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6" disabled={loading}>
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

