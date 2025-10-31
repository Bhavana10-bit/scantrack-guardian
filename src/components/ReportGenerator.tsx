import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ReportGenerator = () => {
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!className) {
      toast({
        title: "Missing information",
        description: "Please enter a class name",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .eq('class_name', className)
        .order('attendance_date', { ascending: false });

      if (startDate) {
        query = query.gte('attendance_date', startDate);
      }
      if (endDate) {
        query = query.lte('attendance_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No data found",
          description: "No attendance records found for the given criteria",
          variant: "destructive",
        });
        return;
      }

      // Calculate total unique class sessions
      const uniqueDates = new Set(data.map(record => record.attendance_date));
      const totalClasses = uniqueDates.size;

      // Get all unique student IDs to ensure every student has a record
      const allStudentIds = new Set(data.map(record => record.student_id));

      // Calculate statistics per student
      const studentStats = new Map<string, { name: string; present: number; absent: number; late: number; total: number }>();
      
      // Initialize all students with zero counts
      allStudentIds.forEach(studentId => {
        const studentRecord = data.find(r => r.student_id === studentId);
        if (studentRecord) {
          studentStats.set(studentId, {
            name: studentRecord.student_name,
            present: 0,
            absent: 0,
            late: 0,
            total: totalClasses,
          });
        }
      });

      // Count attendance records per student
      data.forEach(record => {
        const stats = studentStats.get(record.student_id);
        if (stats) {
          stats[record.status as 'present' | 'absent' | 'late']++;
        }
      });

      // Mark remaining dates as absent for students who don't have all dates
      studentStats.forEach((stats, studentId) => {
        const studentRecordCount = stats.present + stats.absent + stats.late;
        if (studentRecordCount < totalClasses) {
          stats.absent += (totalClasses - studentRecordCount);
        }
      });

      // Generate CSV
      let csv = "Roll No,Student Name,Total Classes,Present,Absent,Late,Attendance %\n";
      
      studentStats.forEach((stats, rollNo) => {
        const percentage = ((stats.present / stats.total) * 100).toFixed(2);
        csv += `${rollNo},${stats.name},${stats.total},${stats.present},${stats.absent},${stats.late},${percentage}%\n`;
      });

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${className}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report generated!",
        description: `Downloaded report for ${studentStats.size} students`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-elegant border-border/50">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
          <FileDown className="h-6 w-6 text-secondary" />
        </div>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>
          Download attendance reports with statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reportClass">Class Name</Label>
          <Input
            id="reportClass"
            placeholder="e.g., Mathematics 101"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>

        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full"
          variant="secondary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" />
              Generate & Download Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
