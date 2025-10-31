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

        {/* OCR Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <OCRUpload teacherId={teacherId} onScanComplete={handleScanComplete} />
          <ReportGenerator />
        </div>

        {/* Manual Attendance Section */}
        <div className="mb-8">
          <ManualAttendance onComplete={handleScanComplete} />
        </div>

        {/* Attendance History */}
        <div className="mb-8">
          <AttendanceHistory key={refreshKey} />
        </div>

        {/* Student Credentials */}
        <div className="mb-8">
          <StudentCredentials />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-border/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Record student attendance for today's classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full">
                Start Marking Attendance
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-border/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                View your class schedule for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Classes */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
            <CardDescription>Your scheduled classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Mathematics 101", time: "9:00 AM - 10:30 AM", students: 32, marked: true },
                { name: "Physics 202", time: "11:00 AM - 12:30 PM", students: 28, marked: true },
                { name: "Chemistry 303", time: "2:00 PM - 3:30 PM", students: 30, marked: false },
              ].map((classItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{classItem.name}</h4>
                      <p className="text-sm text-muted-foreground">{classItem.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{classItem.students} Students</p>
                      <p className="text-xs text-muted-foreground">
                        {classItem.marked ? "Attendance Marked" : "Pending"}
                      </p>
                    </div>
                    {classItem.marked ? (
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    ) : (
                      <Button size="sm" variant="outline">Mark</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
