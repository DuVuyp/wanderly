import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  User, Lock, Shield, Bell, LogOut, Menu, X,
  Mail, Phone, Camera, Save, Edit2, XCircle, Loader2, ArrowLeft
} from "lucide-react"
import { getProfile, updateProfile, changePassword, uploadAvatar } from '../api/profile'
import { logout } from '../api/auth'
import { clearAuthStorage } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone_number: z.string().max(20).optional().nullable(),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/\d/, 'Must contain number')
    .regex(/[^A-Za-z\d]/, 'Must contain special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const PRIMARY_COLOR_CLASSES = "bg-gradient-to-r from-gradient-start to-button-gradient-pink hover:from-gradient-start/90 hover:to-button-gradient-pink/90 shadow-primary/30"

// Reusable Input Field adapting template's styling for React Hook Form
const InputField = React.forwardRef(({ label, name, icon: Icon = User, disabled, type = 'text', error, ...rest }, ref) => (
  <div>
    <label className="text-sm font-semibold text-on-surface-variant flex items-center mb-2">
      <Icon className="mr-2 w-4 h-4 text-primary" /> {label}
    </label>
    <input
      type={type}
      name={name}
      ref={ref}
      disabled={disabled}
      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 
        ${disabled
          ? 'bg-surface-variant/50 border-outline-variant cursor-not-allowed text-on-surface-variant'
          : 'bg-white border-outline-variant text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20'
        }`}
      {...rest}
    />
    {error && <p className="mt-1 text-sm text-error">{error.message}</p>}
  </div>
));
InputField.displayName = 'InputField';

export default function Profile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("account")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const profile = profileData?.data || profileData

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || '',
      phone_number: profile?.phone_number || '',
    }
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Profile updated successfully')
      setIsEditing(false)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.data }))
      window.dispatchEvent(new Event('storage'))
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update profile')
  })

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to upload avatar')
  })

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
      resetPassword()
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to change password')
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      clearAuthStorage()
      navigate('/login', { replace: true })
    }
  }

  const TAB_LIST = [
    { key: "account", label: "Account Details", Icon: User },
    { key: "security", label: "Security", Icon: Lock },
    { key: "privacy", label: "Privacy", Icon: Shield },
    { key: "notifications", label: "Notifications", Icon: Bell },
  ];

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-on-surface-variant">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white shadow-sm hover:bg-surface-variant transition-colors border border-outline-variant"
              >
                <ArrowLeft className="w-5 h-5 text-on-surface" />
              </button>
              <h1 className="font-display text-3xl font-extrabold text-on-surface">Settings</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white shadow-md hover:bg-surface-variant/30 transition-colors border border-outline-variant"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-on-surface-variant" /> : <Menu className="w-6 h-6 text-on-surface-variant" />}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-center relative mb-8 md:mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 p-3 rounded-xl bg-white shadow-md hover:shadow-lg hover:-translate-x-1 transition-all border border-outline-variant group"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface group-hover:text-primary transition-colors" />
          </button>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface text-center">
            Settings & Profile
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
          {/* SIDEBAR */}
          <div
            className={`${sidebarOpen ? 'fixed inset-0 z-40 lg:relative lg:z-auto bg-black/50 lg:bg-transparent' : 'hidden lg:block'}`}
            onClick={() => sidebarOpen && setSidebarOpen(false)}
          >
            <div
              className={`w-full max-w-xs lg:max-w-none lg:w-80 h-full lg:h-auto bg-white rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl lg:shadow-xl transition-all duration-300 border border-outline-variant ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:sticky lg:top-24 overflow-y-auto lg:overflow-visible`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-2xl font-bold text-on-surface">Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-surface-variant transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {/* User Summary */}
              <div className="text-center mb-6 lg:mb-8">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.full_name || "User")}
                    alt="User Avatar"
                    className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full mx-auto object-cover border-4 border-white shadow-xl"
                  />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-on-surface mt-3 md:mt-4">
                  {profile.full_name}
                </h2>
                <p className="text-xs md:text-sm text-on-surface-variant mt-1 truncate px-2 capitalize">
                  {profile.role}
                </p>
                <p className="text-xs md:text-sm text-on-surface-variant mt-1 truncate px-2">
                  {profile.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {TAB_LIST.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
                    className={`w-full text-left flex items-center px-4 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${activeTab === key ? `text-white ${PRIMARY_COLOR_CLASSES} shadow-lg` : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary"}`}
                  >
                    <Icon className="mr-3 w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}

                <button
                  className="w-full text-left flex items-center px-4 py-3 rounded-xl font-medium text-sm md:text-base text-error hover:bg-error-container/30 transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 w-5 h-5 flex-shrink-0" />
                  Log Out
                </button>
              </nav>
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl transition duration-500 border border-outline-variant">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  {TAB_LIST.find((t) => t.key === activeTab)?.Icon && (
                    <div className="p-2 rounded-lg bg-primary/10">
                      {React.createElement(TAB_LIST.find((t) => t.key === activeTab)?.Icon, {
                        className: "w-6 h-6 text-primary"
                      })}
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-on-surface">
                    {TAB_LIST.find((t) => t.key === activeTab)?.label}
                  </h3>
                </div>
              </div>
              <div className="overflow-x-hidden">
                
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div className="border-b border-outline-variant pb-4 mb-6">
                      <h4 className="text-xl font-bold text-on-surface">Basic Information</h4>
                      <p className="text-sm text-on-surface-variant mt-1">Update your personal information and profile picture</p>
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col items-center space-y-4 mb-8">
                      <div className="relative">
                        <img
                          src={avatarPreview || profile.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.full_name || "User")}
                          alt="Avatar preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                        {isEditing && (
                          <label className={`absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-lg ${uploadMutation.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-variant'} transition border-2 border-outline-variant`}>
                            {uploadMutation.isPending ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Camera className="w-5 h-5 text-primary" />}
                            <input type="file" accept="image/*" className="hidden" disabled={uploadMutation.isPending} onChange={handleAvatarChange} />
                          </label>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSubmitProfile(async (data) => {
                      try {
                        let finalData = { ...data };
                        if (avatarFile) {
                          const uploadRes = await uploadMutation.mutateAsync(avatarFile);
                          finalData.avatar = uploadRes.data.url;
                        }
                        await updateMutation.mutateAsync(finalData);
                      } catch (error) {
                        console.error('Error saving profile:', error);
                      }
                    })}>
                      <div className="space-y-5">
                        <InputField
                          label="Full Name"
                          disabled={!isEditing}
                          error={profileErrors.full_name}
                          {...registerProfile('full_name')}
                        />
                        <InputField
                          label="Email"
                          icon={Mail}
                          disabled={true}
                          value={profile.email}
                        />
                        <InputField
                          label="Phone Number"
                          icon={Phone}
                          disabled={!isEditing}
                          error={profileErrors.phone_number}
                          {...registerProfile('phone_number')}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-8 flex justify-end gap-3 border-t border-outline-variant mt-8">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => { setIsEditing(false); resetProfile(); setAvatarFile(null); setAvatarPreview(null) }}
                              className="px-6 py-3 rounded-xl font-medium text-on-surface-variant bg-surface-variant/50 hover:bg-surface-variant transition duration-300 shadow-sm flex items-center gap-2"
                            >
                              <XCircle className="inline mr-2 w-4 h-4" /> Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={updateMutation.isPending || uploadMutation.isPending}
                              className={`px-6 py-3 rounded-xl font-semibold text-white ${PRIMARY_COLOR_CLASSES} shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
                            >
                              {updateMutation.isPending || uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />} 
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className={`px-6 py-3 text-white rounded-xl font-semibold shadow-lg transition duration-300 flex items-center gap-2 ${PRIMARY_COLOR_CLASSES}`}
                          >
                            <Edit2 className="w-4 h-4" /> Edit Account
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8">
                    <div className="border-b border-outline-variant pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                        <h4 className="text-xl font-bold text-on-surface">Change Password</h4>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-6">Update your password to keep your account secure.</p>
                      
                      <form onSubmit={handleSubmitPassword((data) => passwordMutation.mutate(data))}>
                        <div className="space-y-5">
                          <InputField
                            label="Current Password"
                            type="password"
                            icon={Lock}
                            error={passwordErrors.oldPassword}
                            {...registerPassword('oldPassword')}
                          />
                          <InputField
                            label="New Password"
                            type="password"
                            icon={Lock}
                            error={passwordErrors.newPassword}
                            {...registerPassword('newPassword')}
                          />
                          <InputField
                            label="Confirm New Password"
                            type="password"
                            icon={Lock}
                            error={passwordErrors.confirmPassword}
                            {...registerPassword('confirmPassword')}
                          />
                        </div>
                        <div className="pt-6 flex justify-end">
                          <button 
                            type="submit" 
                            disabled={passwordMutation.isPending}
                            className={`px-6 py-3 rounded-xl font-semibold text-white ${PRIMARY_COLOR_CLASSES} shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
                          >
                            {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="pt-6 border-outline-variant">
                      <div className="flex items-center justify-between p-5 bg-surface-variant/30 rounded-xl border border-outline-variant">
                        <div>
                          <p className="font-medium text-on-surface mb-1">Enable 2FA for an extra layer of security</p>
                          <p className="text-sm text-on-surface-variant">Coming soon in next update</p>
                        </div>
                        <button disabled className="px-5 py-2.5 bg-surface-variant/50 text-on-surface-variant rounded-xl font-medium shadow-sm cursor-not-allowed border border-outline-variant">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <p className="text-on-surface-variant">Privacy settings are currently unavailable.</p>
                  </div>
                )}
                
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <p className="text-on-surface-variant">Notification settings are currently unavailable.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
