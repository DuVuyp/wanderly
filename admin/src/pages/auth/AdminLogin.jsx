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
            <div className="min-h-screen flex flex-col md:flex-row overflow-hidden relative transition-colors">
                {/* Left Side - Image/Branding */}
                <section className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center p-12 lg:p-16">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                            alt="Admin Hotel Management" 
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay with brand gradient */}
                        <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#7FFFD4]/30 to-[#FF6B6B]/30 mix-blend-overlay"></div>
                    </div>

                    {/* Content over image */}
                    <div className="relative z-10 w-full max-w-xl text-white">
                        <div className="mb-10 backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/10">
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                                <span className="material-symbols-outlined text-4xl text-white">
                                    admin_panel_settings
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Wanderly <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7FFFD4] to-[#FF6B6B]">
                                    Workspace
                                </span>
                            </h1>
                            <p className="text-lg text-white/90 leading-relaxed max-w-md">
                                Empowering your journey. Manage properties, track bookings, and oversee the entire travel ecosystem with precision and elegance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Right Side - Form */}
                <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 z-20 relative bg-gradient-to-br from-[#7FFFD4]/10 via-gray-50 to-[#FF6B6B]/10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                    {/* Decorative blobs for light mode */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#7FFFD4]/20 rounded-full blur-3xl dark:hidden pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6B6B]/20 rounded-full blur-3xl dark:hidden pointer-events-none"></div>

                    <div className="w-full max-w-[440px] bg-white/70 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 dark:border-gray-700 transition-all z-10">
                        <div className="flex flex-col items-center mb-10 text-center">
                            <div className="md:hidden w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-[#7FFFD4]/20 to-[#FF6B6B]/20 flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#7FFFD4] to-[#FF6B6B]">
                                    admin_panel_settings
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Sign in to access the administrator dashboard
                            </p>
                        </div>

                        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                            <div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">
                                        mail
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-14 pl-12 pr-4 bg-white/60 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700 rounded-xl focus:border-[#7FFFD4] focus:ring-2 focus:ring-[#7FFFD4]/30 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm"
                                        placeholder="Admin Email"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">
                                        lock
                                    </span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-14 pl-12 pr-4 bg-white/60 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700 rounded-xl focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/30 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#7FFFD4] focus:ring-[#7FFFD4]/30 bg-white dark:bg-gray-900 cursor-pointer" 
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <a href="#" className="text-sm text-[#FF6B6B] hover:text-[#ff4e4e] font-medium hover:underline transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full h-14 mt-2 rounded-xl text-white font-semibold text-base shadow-lg shadow-[#FF6B6B]/20 hover:shadow-[#FF6B6B]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-[#7FFFD4] to-[#FF6B6B]" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Protected by Wanderly Security System
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

