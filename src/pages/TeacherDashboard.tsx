import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Calendar, BarChart3, LogOut, ClipboardCheck } from "lucide-react";
import { OCRUpload } from "@/components/OCRUpload";
import { AttendanceHistory } from "@/components/AttendanceHistory";
import { ManualAttendance } from "@/components/ManualAttendance";
import { ReportGenerator } from "@/components/ReportGenerator";
import { StudentCredentials } from "@/components/StudentCredentials";
import { useState } from "react";
import { useAttendanceStats } from "@/hooks/useAttendanceStats";

const TeacherDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const teacherId = "teacher123"; // In a real app, this would come from auth
  const { stats, loading } = useAttendanceStats();

  const handleScanComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

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
          <Link to="/teacher/login">
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
          <h2 className="text-3xl font-bold mb-2">Welcome, Teacher!</h2>
          <p className="text-muted-foreground">Manage your classes and track student attendance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "..." : stats.totalStudents}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Across all classes
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Present Today</CardDescription>
              <CardTitle className="text-3xl text-secondary">
                {loading ? "..." : stats.presentToday}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                {stats.totalStudents > 0 
                  ? `${Math.round((stats.presentToday / stats.totalStudents) * 100)}%` 
                  : "0%"} Attendance
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Absent Today</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {loading ? "..." : stats.absentToday}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {stats.absentToday > 0 ? "Requires attention" : "All present"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Active Classes</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "..." : stats.activeClasses}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                This semester
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Input Methods */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <OCRUpload teacherId={teacherId} onScanComplete={handleScanComplete} />
          <ManualAttendance onComplete={handleScanComplete} />
          <ReportGenerator />
        </div>

        {/* Attendance History */}
        <div className="mb-8">
          <AttendanceHistory key={refreshKey} />
        </div>

        {/* Student Credentials */}
        <div className="mb-8">
          <StudentCredentials />
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
