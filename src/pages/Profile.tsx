import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";

export default function Profile() {
  const [form, setForm] = useState({
    fName: '',
    lName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    deviceId: '',
  });

//   return (
//     <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
//       <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

//       <div className="grid grid-cols-2 gap-4">
//         <Input
//           placeholder="First Name"
//           value={form.fName}
//           onChange={(e) =>
//             setForm({ ...form, fName: e.target.value })
//           }
//         />

//         <Input
//           placeholder="Last Name"
//           value={form.lName}
//           onChange={(e) =>
//             setForm({ ...form, lName: e.target.value })
//           }
//         />
//       </div>

//       <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between">
//         <span>Password</span>
//         <Button variant="outline" asChild>
//           <a href="/forgot-password">Yes</a>
//         </Button>
//       </div>
//     </div>
//   );
 return (
    <div className="flex justify-center items-start p-10">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="text-black" size={22} />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            User&apos;s credentials
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">First Name</label>
              <Input
                value={form.fName}
                onChange={(e) =>
                  setForm({ ...form, fName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <Input
                value={form.lName}
                onChange={(e) =>
                  setForm({ ...form, lName: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-indigo-500" size={22} />
            <div>
              <h3 className="font-semibold">Password</h3>
              <p className="text-sm text-muted-foreground">
                Password change operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Do you want to change?
            </span>
            <Button
              className="bg-primary/90 hover:bg-primary/80 text-white rounded-full px-6"
              asChild
            >
              <a href="/forgot-password">Yes</a>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
