import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, CheckCircle2, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ScanTrack
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground">
            Smart Attendance
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Management System
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Track, manage, and analyze student attendance with ease. 
            Empower educators and students with modern attendance solutions.
          </p>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Teacher Portal */}
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-border/50">
            <CardHeader className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Teacher Portal</CardTitle>
              <CardDescription className="text-center">
                Manage classes, track attendance, and view analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Mark student attendance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Generate attendance reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  View class analytics
                </li>
              </ul>
              <Link to="/teacher/login" className="block">
                <Button variant="hero" className="w-full" size="lg">
                  Teacher Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Student Portal */}
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-border/50">
            <CardHeader className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <GraduationCap className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl text-center">Student Portal</CardTitle>
              <CardDescription className="text-center">
                View your attendance records and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Check attendance status
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  View attendance history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Track performance metrics
                </li>
              </ul>
              <Link to="/student/login" className="block">
                <Button variant="hero" className="w-full" size="lg">
                  Student Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose ScanTrack?</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold">Very Easy to Use</h4>
            <p className="text-sm text-muted-foreground">
              Simple and intuitive interface that anyone can use without training
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold">Saves Time for Teachers</h4>
            <p className="text-sm text-muted-foreground">
              Quick attendance marking with OCR technology reduces manual work
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold">Stores Data & Generates Reports</h4>
            <p className="text-sm text-muted-foreground">
              Automatically stores attendance records and creates detailed reports
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ScanTrack. Modern attendance management made simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
