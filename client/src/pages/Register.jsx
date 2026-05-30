import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { register as registerUser } from '../api/auth';

const schema = z.object({
  fullName: z.string().trim().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Full name is required',
      });
      return;
    }

    if (value.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name must be at least 2 characters',
      });
    }
  }),
  email: z.string().trim().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email is required',
      });
      return;
    }

    if (!z.email().safeParse(value).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email must be a valid email address',
      });
    }
  }),
  password: z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required',
      });
      return;
    }

    if (value.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z\d]/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must include uppercase, lowercase, number, and special character',
      });
    }
  }),
  confirmPassword: z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Confirm password is required',
      });
      return;
    }

    if (value.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
      });
    }
  }),
  agreeTerms: z.boolean().optional().refine((value) => value === true, {
    message: 'You must agree to the Terms & Privacy Policy',
  }),
}).superRefine((data, ctx) => {
  if (data.password && data.confirmPassword && data.password === data.confirmPassword) {
    return;
  }

  if (!data.password?.trim() || !data.confirmPassword?.trim()) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { fullName, ...rest } = data;
      delete rest.confirmPassword;
      delete rest.agreeTerms;
      const response = await registerUser({ full_name: fullName, ...rest });
      toast.success(response.message || 'Registration successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden relative bg-surface-bright">
      {/* ====== LEFT PANEL: Immersive Visual ====== */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden tropical-gradient items-center justify-center p-12 lg:p-16">
        {/* Blurred blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gradient-end hero-blob opacity-30 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-button-gradient-pink hero-blob opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-white">
          {/* Image */}
          <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl mb-10">
            <img
              className="w-full h-full object-cover"
              alt="Heart-shaped tropical island"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiNxfvGXsLhTT6U7sgP6CyBS4MJehyKoN92Od_K3saftqqTHA_9TTANTzRUjtEOiZL6FoTinUlbDYln1BtaZykYXOAWlbCH2oHS-Y8TM_SOTwB6X2BBaKW1hXDhpYusR274uGl61M06MeDYY5bdmG8LWnblU4hRPwMkiXE0-nKF1QSDwcZaZrdizp4-KPJKduoOUFOigppY2NRKxjlHQAasQDbwOROLBPHrO8JlLpWixjpULnV6_EqyBilcPlLs5p09TXDvAbmX5nj"
            />

            {/* Floating Card - Travelers */}
            <div className="absolute top-6 right-6 glass-card py-3 px-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              </div>
              <div>
                <p className="font-sans font-bold text-on-surface text-sm leading-tight">10K+ Travelers</p>
                <p className="font-sans text-xs text-on-surface-variant opacity-70">Exploring now</p>
              </div>
            </div>

            {/* Floating Card - Destinations */}
            <div className="absolute bottom-6 left-6 glass-card py-3 px-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
              </div>
              <div>
                <p className="font-sans font-bold text-on-surface text-sm leading-tight">2K+ Destinations</p>
                <p className="font-sans text-xs text-on-surface-variant opacity-70">Handpicked for you</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center">
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">Discover the World</h1>
            <p className="font-sans text-base text-white/85 max-w-md mx-auto leading-relaxed">
              Your journey to the most exotic places on Earth starts here. Join our community of dreamers and explorers.
            </p>
          </div>
        </div>
      </section>

      {/* ====== RIGHT PANEL: Register Form ====== */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 z-20 relative">
        {/* Mobile gradient BG */}
        <div className="absolute inset-0 tropical-gradient md:hidden opacity-20 pointer-events-none" />

        <div className="w-full max-w-[440px] glass-card rounded-3xl p-8 sm:p-10 border border-white/30 shadow-2xl relative z-10">

          {/* Brand */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                travel_explore
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-on-surface mb-1.5">
              Create Your Account
            </h2>
            <p className="font-sans text-sm text-on-surface-variant text-center">
              Join Wanderly and start building unforgettable journeys.
            </p>
          </div>



          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                  person
                </span>
                <input
                  className="w-full h-13 pl-12 pr-4 bg-white/60 border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm text-on-surface placeholder:text-outline"
                  placeholder="Full Name"
                  type="text"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-error text-xs mt-1 ml-1 font-sans">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                  mail
                </span>
                <input
                  className="w-full h-13 pl-12 pr-4 bg-white/60 border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm text-on-surface placeholder:text-outline"
                  placeholder="Email Address"
                  type="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1 ml-1 font-sans">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                  lock
                </span>
                <input
                  className="w-full h-13 pl-12 pr-4 bg-white/60 border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm text-on-surface placeholder:text-outline"
                  placeholder="Password"
                  type="password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1 ml-1 font-sans">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
                  lock_reset
                </span>
                <input
                  className="w-full h-13 pl-12 pr-4 bg-white/60 border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm text-on-surface placeholder:text-outline"
                  placeholder="Confirm Password"
                  type="password"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-error text-xs mt-1 ml-1 font-sans">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  className="w-4 h-4 mt-0.5 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                  type="checkbox"
                  {...register("agreeTerms")}
                />
                <span className="font-sans text-xs text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
                  I agree to <a className="text-primary font-semibold hover:underline" href="#">Terms</a> &amp; <a className="text-primary font-semibold hover:underline" href="#">Privacy Policy</a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-error text-xs mt-1 ml-1 font-sans">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              className="w-full h-13 rounded-xl text-white font-sans font-semibold text-base shadow-lg shadow-primary-container/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 bg-gradient-to-r from-gradient-start to-button-gradient-pink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Begin My Journey'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
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

          {/* Footer */}
          <p className="mt-7 text-center font-sans text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
