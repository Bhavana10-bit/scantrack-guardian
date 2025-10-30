import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Student {
  student_id: string;
  student_name: string;
  totalClasses: number;
}

export const StudentCredentials = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('student_id, student_name');

      if (error) throw error;

      // Get unique students and count their classes
      const studentMap = new Map<string, Student>();
      
      data?.forEach(record => {
        if (!studentMap.has(record.student_id)) {
          studentMap.set(record.student_id, {
            student_id: record.student_id,
            student_name: record.student_name,
            totalClasses: 0
          });
        }
        studentMap.get(record.student_id)!.totalClasses++;
      });

      const uniqueStudents = Array.from(studentMap.values())
        .sort((a, b) => a.student_id.localeCompare(b.student_id));
      
      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = (studentId: string) => {
    const credentials = `Student ID: ${studentId}\nPassword: ${studentId}`;
    navigator.clipboard.writeText(credentials);
    setCopiedId(studentId);
    toast({
      title: "Copied!",
      description: "Student credentials copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <Card className="shadow-elegant border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading student credentials...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant border-border/50">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
          <UserCircle className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Student Login Credentials</CardTitle>
        <CardDescription>
          Share these credentials with students to access their attendance portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No students found. Add attendance records to see student credentials.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.student_id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold">{student.student_name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {student.totalClasses} classes
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Student ID: <span className="font-mono font-semibold text-foreground">{student.student_id}</span></p>
                    <p>Password: <span className="font-mono font-semibold text-foreground">{student.student_id}</span></p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCredentials(student.student_id)}
                  className="ml-4"
                >
                  {copiedId === student.student_id ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
