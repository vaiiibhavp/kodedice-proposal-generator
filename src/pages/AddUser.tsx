import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { registerUser } from '@/services/auth_service';

export default function AddUser() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fName: '',
    lName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // deviceId: '',
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      await registerUser({
        fName: form.fName,
        lName: form.lName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        // deviceId: '12345', // static or generate dynamically
      });

      toast.success('Account created successfully');
      // navigate('/login');
      navigate('/user-list');
    } catch (err: any) {
      const message =
        err?.response?.data?.msg || 'Signup failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-lg rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            ➕ Create User
          </CardTitle>
          <CardDescription>Add new user</CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  id="fName"
                  placeholder="Enter First Name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  id="lName"
                  placeholder="Enter Last Name"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Your Email"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone No.</Label>
                <Input
                  id="phone"
                  placeholder="+91"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  // type="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  // type="password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/user-list")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating user...' : 'Save'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );

}
