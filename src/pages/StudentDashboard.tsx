import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar, TrendingUp, LogOut, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const StudentDashboard = () => {
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
          <h2 className="text-3xl font-bold mb-2">Welcome Back, Student!</h2>
          <p className="text-muted-foreground">Track your attendance and stay on top of your classes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Overall Attendance</CardDescription>
              <CardTitle className="text-3xl text-secondary">87%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={87} className="mb-2" />
              <p className="text-sm text-muted-foreground">Above minimum requirement</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Classes Attended</CardDescription>
              <CardTitle className="text-3xl">142</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Out of 163 total
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl text-primary">12</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Days of perfect attendance
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Status */}
        <Card className="shadow-elegant border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
            <CardDescription>Your attendance for {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Mathematics 101", time: "9:00 AM", status: "present" },
                { name: "Physics 202", time: "11:00 AM", status: "present" },
                { name: "Chemistry 303", time: "2:00 PM", status: "upcoming" },
              ].map((classItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{classItem.name}</h4>
                      <p className="text-sm text-muted-foreground">{classItem.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {classItem.status === "present" ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                        <span className="text-sm font-medium text-secondary">Present</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Attendance */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: "Mathematics 101", present: 28, total: 32, percentage: 88 },
                { subject: "Physics 202", present: 25, total: 28, percentage: 89 },
                { subject: "Chemistry 303", present: 26, total: 30, percentage: 87 },
                { subject: "English 101", present: 30, total: 35, percentage: 86 },
                { subject: "Computer Science 201", present: 33, total: 38, percentage: 87 },
              ].map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{subject.subject}</span>
                    <span className="text-muted-foreground">
                      {subject.present}/{subject.total} ({subject.percentage}%)
                    </span>
                  </div>
                  <Progress value={subject.percentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
