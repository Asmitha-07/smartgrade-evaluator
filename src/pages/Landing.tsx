import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen, Users, Zap, BarChart3, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">ScriptGrade</span>
          </div>
          <Button onClick={() => navigate("/auth")} className="gap-2 font-semibold">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(221_83%_53%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-6 py-24 lg:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Zap className="h-3.5 w-3.5" /> AI-Powered Evaluation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Automated Answer
            <br />
            <span className="text-primary">Evaluation System</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            ScriptGrade uses AI to evaluate student answer scripts against faculty answer keys.
            Get instant marks, detailed feedback, and downloadable reports.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 font-semibold px-8 h-12 text-base">
              Login / Sign Up <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">For Staff</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> Select a subject</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> Upload the Question Paper (PDF)</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> Upload the Answer Key (PDF)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">For Students</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> Select a subject</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> Upload your Answer Script (PDF)</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> View results & download report</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="container mx-auto px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-foreground mb-12">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: BarChart3, title: "Detailed Analytics", desc: "Part-wise breakdown with question-level feedback" },
              { icon: FileText, title: "PDF Reports", desc: "Download comprehensive evaluation reports" },
              { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and role-protected" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center rounded-2xl border border-border bg-card p-8">
                <Icon className="mx-auto h-8 w-8 text-primary mb-4" />
                <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ScriptGrade · AI-Powered Answer Evaluation System
        </div>
      </footer>
    </div>
  );
};

export default Landing;
