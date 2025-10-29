import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  student_name: string;
  status: string;
  attendance_date: string;
  class_name: string;
}

export const AttendanceHistory = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('attendance_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'late':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-elegant border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading attendance history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant border-border/50">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
          <Users className="h-6 w-6 text-secondary" />
        </div>
        <CardTitle>Recent Attendance Records</CardTitle>
        <CardDescription>
          Latest attendance entries from OCR scans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No attendance records yet. Upload an attendance sheet to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{record.student_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {record.class_name} • {format(new Date(record.attendance_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};