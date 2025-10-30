import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  status: string;
  attendance_date: string;
  class_name: string;
  scan_id: string;
}

interface GroupedScan {
  scanId: string;
  date: string;
  className: string;
  records: AttendanceRecord[];
}

export const AttendanceHistory = () => {
  const [groupedScans, setGroupedScans] = useState<GroupedScan[]>([]);
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
        .limit(100);

      if (error) throw error;
      
      // Group records by scan_id
      const grouped = new Map<string, GroupedScan>();
      
      data?.forEach(record => {
        const scanId = record.scan_id || 'manual';
        if (!grouped.has(scanId)) {
          grouped.set(scanId, {
            scanId,
            date: record.attendance_date,
            className: record.class_name,
            records: []
          });
        }
        grouped.get(scanId)!.records.push(record);
      });
      
      // Convert to array and take only the 5 most recent scans
      const scansArray = Array.from(grouped.values()).slice(0, 5);
      setGroupedScans(scansArray);
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
        {groupedScans.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No attendance records yet. Upload an attendance sheet to get started.
          </p>
        ) : (
          <div className="space-y-6">
            {groupedScans.map((scan) => (
              <div key={scan.scanId} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Calendar className="h-4 w-4 text-secondary" />
                  <h3 className="font-semibold">
                    {scan.className} - {format(new Date(scan.date), 'MMM dd, yyyy')}
                  </h3>
                  <Badge variant="outline" className="ml-auto">
                    {scan.records.length} students
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {scan.records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                          {record.student_id}
                        </div>
                        <span className="font-medium">{record.student_name}</span>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};