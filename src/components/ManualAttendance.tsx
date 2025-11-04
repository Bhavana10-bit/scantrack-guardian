import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Plus, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceEntry {
  rollNo: string;
  studentName: string;
  status: "present" | "absent" | "late";
}

interface ManualAttendanceProps {
  onComplete?: () => void;
}

export const ManualAttendance = ({ onComplete }: ManualAttendanceProps) => {
  const [className, setClassName] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<AttendanceEntry[]>([
    { rollNo: "", studentName: "", status: "present" }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const addEntry = () => {
    setEntries([...entries, { rollNo: "", studentName: "", status: "present" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof AttendanceEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleSave = async () => {
    if (!className || entries.some(e => !e.rollNo || !e.studentName)) {
      toast({
        title: "Missing information",
        description: "Please fill in class name and all student details",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      let updatedCount = 0;
      let insertedCount = 0;

      // Process each entry: update if exists, insert if new
      for (const entry of entries) {
        // Check if record exists for this student on this date
        const { data: existingRecords, error: fetchError } = await supabase
          .from('attendance_records')
          .select('id')
          .eq('student_id', entry.rollNo)
          .eq('attendance_date', attendanceDate)
          .eq('class_name', className);

        if (fetchError) throw fetchError;

        if (existingRecords && existingRecords.length > 0) {
          // Update all existing records for this student/date/class
          const { error: updateError } = await supabase
            .from('attendance_records')
            .update({
              student_name: entry.studentName,
              status: entry.status,
            })
            .eq('student_id', entry.rollNo)
            .eq('attendance_date', attendanceDate)
            .eq('class_name', className);

          if (updateError) throw updateError;
          updatedCount++;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('attendance_records')
            .insert({
              student_id: entry.rollNo,
              student_name: entry.studentName,
              class_name: className,
              status: entry.status,
              attendance_date: attendanceDate,
              scan_id: null,
            });

          if (insertError) throw insertError;
          insertedCount++;
        }
      }

      const message = updatedCount > 0 && insertedCount > 0
        ? `Updated ${updatedCount} and added ${insertedCount} records`
        : updatedCount > 0
        ? `Updated ${updatedCount} attendance record${updatedCount > 1 ? 's' : ''}`
        : `Saved ${insertedCount} new attendance record${insertedCount > 1 ? 's' : ''}`;

      toast({
        title: "Success!",
        description: message,
      });

      setClassName("");
      setEntries([{ rollNo: "", studentName: "", status: "present" }]);
      onComplete?.();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-elegant border-border/50">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
          <ClipboardCheck className="h-6 w-6 text-accent" />
        </div>
        <CardTitle>Mark Attendance Manually</CardTitle>
        <CardDescription>
          Enter student details and mark their attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              placeholder="e.g., Mathematics 101"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.map((entry, index) => (
            <div key={index} className="flex gap-2 items-end p-3 border border-border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Roll No</Label>
                <Input
                  placeholder="Roll No"
                  value={entry.rollNo}
                  onChange={(e) => updateEntry(index, "rollNo", e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Student Name</Label>
                <Input
                  placeholder="Student Name"
                  value={entry.studentName}
                  onChange={(e) => updateEntry(index, "studentName", e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="w-32 space-y-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={entry.status}
                  onValueChange={(value) => updateEntry(index, "status", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {entries.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeEntry(index)}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addEntry}
            disabled={isSaving}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
            variant="hero"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Attendance
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
