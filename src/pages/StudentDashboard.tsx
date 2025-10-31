import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogOut } from "lucide-react";
import { StudentAttendanceView } from "@/components/StudentAttendanceView";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const location = useLocation();
  const studentId = location.state?.studentId || "student123";
  const [studentName, setStudentName] = useState("Student");

  useEffect(() => {
    const fetchStudentName = async () => {
      const { data } = await supabase
        .from('attendance_records')
        .select('student_name')
        .eq('student_id', studentId)
        .limit(1);
      
      if (data && data.length > 0) {
        setStudentName(data[0].student_name);
      }
    };
    
    fetchStudentName();
  }, [studentId]);

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
          <Link to="/student/login">
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome Back, {studentName}!</h2>
          <p className="text-muted-foreground">Track your attendance and stay on top of your classes</p>
        </div>

        <StudentAttendanceView studentId={studentId} />
      </div>
    </div>
  );
};

export default StudentDashboard;
