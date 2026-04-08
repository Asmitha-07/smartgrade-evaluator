import { GraduationCap } from "lucide-react";

const Navbar = () => (
  <nav className="border-b border-border bg-background sticky top-0 z-50">
    <div className="container mx-auto flex items-center gap-2.5 px-6 py-4">
      <GraduationCap className="h-6 w-6 text-foreground" />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        ScriptGrade
      </span>
    </div>
  </nav>
);

export default Navbar;
