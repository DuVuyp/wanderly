import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Compass, LogOut, Menu, UserCircle, X } from 'lucide-react'
import { logout } from '../../api/auth'
import { clearAuthStorage, getDefaultRouteByRole, getStoredUser } from '../../utils/auth'

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/home#destinations', label: 'Destinations' },
  { to: '/home#services', label: 'Services' },
  { to: '/home#planner', label: 'Trip Planner' },
]

function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState(() => getStoredUser())
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    const handleStorage = () => setUser(getStoredUser())
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('storage', handleStorage)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
    } finally {
      clearAuthStorage()
      setUser(null)
      setIsDropdownOpen(false)
      setIsMenuOpen(false)
      navigate('/login', { replace: true })
    }
  }

  const defaultRoute = getDefaultRouteByRole(user?.role)

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b transition-all duration-300',
        isScrolled
          ? 'border-white/50 bg-white/85 shadow-lg shadow-primary/10 backdrop-blur-xl'
          : 'border-transparent bg-white/70 backdrop-blur-md',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to={defaultRoute} className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gradient-start via-button-gradient-pink to-gradient-end text-white shadow-lg shadow-primary-container/40">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-gradient">Wanderly</p>
            <p className="text-xs text-on-surface-variant">Travel smarter, stay better</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/50 bg-white/75 p-2 shadow-sm lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-gradient-start to-button-gradient-pink text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-white/60 bg-white/85 px-3 py-2 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <UserCircle className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="max-w-40 truncate text-sm font-semibold text-on-surface">
                    {user.full_name || 'Traveler'}
                  </p>
                  <p className="text-xs capitalize text-on-surface-variant">{user.role || 'traveler'}</p>
                </div>
              </button>

              {isDropdownOpen ? (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-xl">
                  <div className="border-b border-outline-variant px-4 py-4">
                    <p className="truncate font-semibold text-on-surface">{user.full_name || 'Traveler'}</p>
                    <p className="truncate text-sm text-on-surface-variant">{user.email || ''}</p>
                  </div>
                  <div className="p-2 border-b border-outline-variant">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-on-surface transition hover:bg-surface-variant"
                    >
                      <UserCircle className="h-4 w-4 text-on-surface-variant" />
                      Account Settings
                    </Link>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-primary/20 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-gradient-start to-button-gradient-pink px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-container/40 transition hover:scale-[1.02]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/60 bg-white/80 p-2 text-on-surface shadow-sm lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-outline-variant bg-white/95 px-4 py-4 shadow-lg backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-on-surface-variant transition hover:bg-primary/10 hover:text-primary"
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-surface-variant/30 px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-variant"
                >
                  <UserCircle className="h-4 w-4" />
                  Account Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl border border-primary/20 px-4 py-3 text-center text-sm font-semibold text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export default Header
