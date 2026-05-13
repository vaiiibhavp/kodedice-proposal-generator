import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  Plus,
  Menu,
  X,
  LogOut,
  CircleUser,
  UserRoundPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { PrometteurLogo } from '@/components/PrometteurLogo';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/proposals', icon: FileText, label: 'Proposals' },
  { to: '/clients', icon: Users, label: 'Leads' },
  { to: '/user-list', icon: UserRoundPlus, label: 'User List', requiresSuperAdmin: true },
  // { to: '/profile', icon: CircleUser, label: 'Profile' },
  // { to: '/notifications', icon: Bell, label: 'Notifications' },<CircleUser />
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        // className="fixed top-4 left-4 z-50 md:hidden"
        className="fixed top-4 left-4 z-50 xl:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          // className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"

          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        //  "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform md:translate-x-0",
        // isOpen ? "translate-x-0" : "-translate-x-full"
        "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform xl:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <PrometteurLogo size={32} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.filter((item) => {
              // Show item if it doesn't require superAdmin or if user is superAdmin
              return !item.requiresSuperAdmin || user?.userType === 'superAdmin';
            }).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive || (item.to === '/' && location.pathname === '/')
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User info and actions */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {user && (
              <div className="px-3 py-2">
                <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <NavLink to="/proposals/new" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Proposal
                </Button>
              </NavLink>

              {/* <NavLink to="/profile" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <CircleUser className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </NavLink> */}
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
