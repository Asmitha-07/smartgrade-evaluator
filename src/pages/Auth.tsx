import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, BookOpen, Users, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, type UserRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/lib/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userRole = await getUserRole(data.user.id);
        toast.success(`Welcome back!`);
        navigate(userRole === "staff" ? "/staff" : "/student");
      } else {
        await signUp(email, password, fullName, role);
        toast.success("Account created! You can now log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(221_83%_63%/0.4),transparent_60%)]" />
        <div className="relative z-10 px-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm mb-8">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground">
            SmartGrade
          </h1>
          <p className="mt-3 text-lg text-primary-foreground/80 font-medium">
            AI-Based Automated Answer Evaluation
          </p>
          <p className="mt-6 text-sm text-primary-foreground/60 leading-relaxed max-w-md mx-auto">
            Upload question papers and answer keys as staff, or submit your answer scripts as a student for instant AI-powered evaluation with detailed feedback.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SmartGrade</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin ? "Sign in to your account to continue" : "Get started with SmartGrade"}
            </p>
          </div>

          {/* Role selector (signup only) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("staff")}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                  role === "staff"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <BookOpen className={`h-5 w-5 ${role === "staff" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${role === "staff" ? "text-primary" : "text-foreground"}`}>Staff</p>
                  <p className="text-xs text-muted-foreground">Upload & manage</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                  role === "student"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Users className={`h-5 w-5 ${role === "student" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${role === "student" ? "text-primary" : "text-foreground"}`}>Student</p>
                  <p className="text-xs text-muted-foreground">Submit & view</p>
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-11 pr-10"
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

            <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
