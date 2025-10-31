import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  activeClasses: number;
}

export const useAttendanceStats = () => {
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    activeClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get unique students
      const { data: studentsData } = await supabase
        .from('attendance_records')
        .select('student_id')
        .order('student_id');
      
      const uniqueStudents = new Set(studentsData?.map(r => r.student_id) || []);

      // Get today's attendance
      const { data: todayData } = await supabase
        .from('attendance_records')
        .select('status, student_id')
        .eq('attendance_date', today);

      const presentToday = new Set(
        todayData?.filter(r => r.status === 'present').map(r => r.student_id) || []
      ).size;

      const absentToday = new Set(
        todayData?.filter(r => r.status === 'absent').map(r => r.student_id) || []
      ).size;

      // Get active classes
      const { data: classesData } = await supabase
        .from('attendance_records')
        .select('class_name');

      const activeClasses = new Set(classesData?.map(r => r.class_name) || []).size;

      setStats({
        totalStudents: uniqueStudents.size,
        presentToday,
        absentToday,
        activeClasses,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading };
};
