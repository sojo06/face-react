// pages/auth.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { origin } from "@/lib/constants";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

const AuthPage = () => {
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    division: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState<string>("");

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${origin}/api/auth/signup`, signupData);
      console.log("Signup Response:", response.data);
      toast.success("Signup successful! Please log in.");
    } catch (err) {
      setError("Error signing up, please try again.");
      toast.error("Error signing up, please try again.");
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${origin}/api/auth/login`, loginData);
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('uid', user.id);
      toast.success("Login successful! Redirecting...");
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      }
    } catch (err) {
      setError('Invalid credentials, please try again.');
      toast.error('Invalid credentials, please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Face Attendance System
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Form Container */}
      <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">Welcome</h2>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 rounded-lg overflow-hidden">
              <TabsTrigger value="login" className="py-2 text-gray-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="py-2 text-gray-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">Login</Button>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={signupData.role}
                    onChange={handleSignupChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={signupData.department}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    name="division"
                    value={signupData.division}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">Sign Up</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
