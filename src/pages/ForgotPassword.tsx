import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Password</h2>
            <p className="text-sm text-muted-foreground">
              Password change operations
            </p>
          </div>
        </div>

        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Password</label>
          <div className="relative">
            <Input type="password" />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" size={18} />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <Input type="password" />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" size={18} />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm New Password</label>
          <div className="relative">
            <Input type="password" />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" size={18} />
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <Button className="bg-primary/90 hover:bg-primary/80 text-white rounded-xl px-6">
            Change Password
          </Button>
        </div>

      </div>
    </div>
  );
}
