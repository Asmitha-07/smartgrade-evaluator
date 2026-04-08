import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Users, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { authenticate, type UserRole } from "@/lib/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = authenticate(email, password, role);
      setLoading(false);

      if (!result.success) {
        setError(result.error!);
        return;
      }

      login(result.role!, result.name!);
      navigate(result.role === "staff" ? "/staff" : "/student");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(221_83%_63%/0.4),transparent_60%)]" />
        <div className="relative z-10 px-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm mb-8">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground">ScriptGrade</h1>
          <p className="mt-3 text-lg text-primary-foreground/80 font-medium">AI-Powered Answer Evaluation</p>
          <p className="mt-6 text-sm text-primary-foreground/60 leading-relaxed max-w-md mx-auto">
            Upload question papers and answer keys as staff, or submit your answer scripts as a student for instant AI-powered evaluation.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ScriptGrade</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select your role and enter your college credentials</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Role selector */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">College Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agalya.2201010@srec.ac.in" required className="h-11" />
              <p className="text-xs text-muted-foreground">Format: name.rollnumber@srec.ac.in</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={4} className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? "Signing in…" : `Sign In as ${role === "staff" ? "Staff" : "Student"}`}
            </Button>
          </form>

          <div className="rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground text-sm mb-2">Login Info</p>
            <p><span className="font-medium">Email:</span> name.rollnumber@srec.ac.in</p>
            <p><span className="font-medium">Password:</span> srec@123</p>
            <p className="mt-1 text-muted-foreground">Example: agalya.2201010@srec.ac.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
