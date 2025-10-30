import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface AttendanceStats {
  className: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

interface StudentAttendanceViewProps {
  studentId: string;
}

export const StudentAttendanceView = ({ studentId }: StudentAttendanceViewProps) => {
  const [stats, setStats] = useState<AttendanceStats[]>([]);
  const [overallStats, setOverallStats] = useState({ present: 0, total: 0, percentage: 0 });
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [studentId]);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .order('attendance_date', { ascending: false });

      if (error) throw error;

      if (data) {
        // Calculate stats per class
        const classMap = new Map<string, AttendanceStats>();
        let totalPresent = 0;
        let totalClasses = 0;

        data.forEach(record => {
          const className = record.class_name;
          if (!classMap.has(className)) {
            classMap.set(className, {
              className,
              present: 0,
              absent: 0,
              late: 0,
              total: 0,
              percentage: 0,
            });
          }
          const stat = classMap.get(className)!;
          stat[record.status as 'present' | 'absent' | 'late']++;
          stat.total++;
          totalClasses++;
          if (record.status === 'present') totalPresent++;
        });

        const statsArray = Array.from(classMap.values()).map(stat => ({
          ...stat,
          percentage: (stat.present / stat.total) * 100,
        }));

        setStats(statsArray);
        setOverallStats({
          present: totalPresent,
          total: totalClasses,
          percentage: totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0,
        });
        setRecentRecords(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card className="shadow-elegant border-border/50">
        <CardHeader className="pb-2">
          <CardDescription>Overall Attendance</CardDescription>
          <CardTitle className="text-3xl text-secondary">
            {overallStats.percentage.toFixed(1)}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallStats.percentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {overallStats.present} out of {overallStats.total} classes attended
          </p>
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
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stat.className}</span>
                  <span className="text-muted-foreground">
                    {stat.present}/{stat.total} ({stat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={stat.percentage} />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-secondary" />
                    {stat.present} Present
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-destructive" />
                    {stat.absent} Absent
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    {stat.late} Late
                  </span>
                </div>
              </div>
            ))}
            {stats.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No attendance records found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card className="shadow-elegant border-border/50">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your latest attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRecords.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium">{record.class_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.attendance_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {record.status === 'present' && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                      <span className="text-sm font-medium text-secondary">Present</span>
                    </>
                  )}
                  {record.status === 'absent' && (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Absent</span>
                    </>
                  )}
                  {record.status === 'late' && (
                    <>
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-500">Late</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
