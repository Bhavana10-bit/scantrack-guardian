import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, GraduationCap, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentLogin = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Trim whitespace from inputs
      const trimmedUserId = userId.trim();
      const trimmedPassword = password.trim();

      // Verify student credentials
      const { data, error } = await supabase
        .from('attendance_records')
        .select('student_id, student_name')
        .eq('student_id', trimmedUserId)
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Login Failed",
          description: "Student ID not found in records",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // For simplicity, password is same as student ID
      if (trimmedPassword !== trimmedUserId) {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data[0].student_name}!`,
      });
      
      navigate("/student/dashboard", { state: { studentId: trimmedUserId } });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ScanTrack
            </h1>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader className="space-y-3">
            <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
              <GraduationCap className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl text-center">Student Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to view your attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Student ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your student ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="hero" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground text-center mb-1 font-semibold">Login Instructions</p>
              <p className="text-xs text-center">
                Use your Student ID for both username and password. Get your credentials from your teacher.
              </p>
            </div>
            <div className="mt-2 text-center">
              <button className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Looking for teacher portal?{" "}
          <Link to="/teacher/login" className="text-primary hover:underline">
            Teacher Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
