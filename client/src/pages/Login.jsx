import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { login } from '../api/auth';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await login(data);
      // API returns: { success, message, data: { user, tokens: { access, refresh } } }
      const { user, tokens } = response.data;
      localStorage.setItem('accessToken', tokens.access.token);
      localStorage.setItem('refreshToken', tokens.refresh.token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(response.message || 'Login successful');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden relative bg-surface-bright">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-end hero-blob opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[45%] w-[500px] h-[500px] bg-gradient-start hero-blob opacity-10 pointer-events-none" />

      {/* ====== LEFT PANEL: Immersive Visual ====== */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden tropical-gradient items-center justify-center p-12 lg:p-16">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/20 rounded-full" />
          <div className="absolute bottom-40 right-10 w-64 h-64 border-4 border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border-2 border-white/10 rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          {/* Headline */}
          <div className="mb-10">
            <h1 className="font-display text-5xl lg:text-6xl text-white mb-5 leading-tight font-bold">
              Welcome Back, <br />Explorer
            </h1>
            <p className="font-sans text-lg text-white/85 max-w-md leading-relaxed">
              Continue planning your next unforgettable journey. Your world is waiting to be discovered.
            </p>
          </div>

          {/* Featured Image + Floating Cards */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-visible">
            <div className="w-full h-full rounded-3xl shadow-2xl overflow-hidden group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Tropical lagoon aerial view"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXtj-j0BSF4xNTr1ChN3sjVjNB85oqzhMqmktUIxHJohJQvnmkCVtXPtpF5rWiMdp0D3Ljpha1TW-mS9VRZBVFiYmyYsZiZn35eOMUUWKxqfS5OjOBUrEVvQlnlbe0qNv7SypiW8Zr1chSZH-G2JbFBILlsvRsId-C-c9cX9RAXoH91QgxYbyTXwWQnpNfkJJgsQePIkkIa9vCY22V6aZ0vp_9q4hlmHvuStbEu-c1RzPyLfZnStmgsWFP59doysesiatQAGInp2QC"
              />
            </div>

            {/* Floating Card - Travelers */}
            <div className="absolute -top-5 -right-5 glass-card py-3 px-4 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container text-xl">groups</span>
              </div>
              <div>
                <p className="font-sans font-bold text-on-surface text-sm leading-none">10K+</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">Travelers</p>
              </div>
            </div>

            {/* Floating Card - Destinations */}
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 glass-card py-3 px-4 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-xl">explore</span>
              </div>
              <div>
                <p className="font-sans font-bold text-on-surface text-sm leading-none">2K+</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">Destinations</p>
              </div>
            </div>

            {/* Floating Card - AI */}
            <div className="absolute -bottom-5 right-8 glass-card py-3 px-4 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
              </div>
              <div>
                <p className="font-sans font-bold text-on-surface text-sm leading-none">AI Trip Planner</p>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">Personalized paths</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== RIGHT PANEL: Login Form ====== */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 z-20">
        <div className="w-full max-w-[440px] glass-card rounded-3xl p-8 sm:p-10 border border-white/30 shadow-2xl">

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                travel_explore
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-on-surface mb-1.5">
              Welcome Back
            </h2>
            <p className="font-sans text-sm text-on-surface-variant text-center">
              Sign in to continue your adventure
            </p>
          </div>



          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                  mail
                </span>
                <input
                  className="w-full h-14 pl-12 pr-4 bg-white/60 border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm text-on-surface placeholder:text-outline"
                  placeholder="Email"
                  type="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1.5 ml-1 font-sans">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                  lock
                </span>
                <input
                  className="w-full h-14 pl-12 pr-4 bg-white/60 border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm text-on-surface placeholder:text-outline"
                  placeholder="Password"
                  type="password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1.5 ml-1 font-sans">{errors.password.message}</p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                  type="checkbox"
                />
                <span className="font-sans text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <a className="font-sans text-sm text-primary font-medium hover:underline" href="#">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              className="w-full h-14 rounded-xl text-white font-sans font-semibold text-base shadow-lg shadow-primary-container/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 bg-gradient-to-r from-gradient-start to-button-gradient-pink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <span className="relative bg-transparent px-4 font-sans text-xs text-outline uppercase tracking-widest flex justify-center">
              <span className="bg-white/75 px-3">or continue with</span>
            </span>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 h-12 bg-white/60 border border-outline-variant rounded-xl hover:bg-white hover:border-primary/30 transition-all group">
              <img
                alt="Google"
                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              />
              <span className="font-sans text-sm text-on-surface font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2.5 h-12 bg-white/60 border border-outline-variant rounded-xl hover:bg-white hover:border-primary/30 transition-all group">
              <span className="material-symbols-outlined text-on-surface text-xl opacity-70 group-hover:opacity-100 transition-opacity">
                phone_iphone
              </span>
              <span className="font-sans text-sm text-on-surface font-medium">Apple</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="mt-8 text-center font-sans text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
