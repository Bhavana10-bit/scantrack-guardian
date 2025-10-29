-- Create table for storing OCR scan results
CREATE TABLE public.ocr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  extracted_text TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing attendance records
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.ocr_scans(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ocr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for ocr_scans (public access for now, can be restricted later)
CREATE POLICY "Allow all operations on ocr_scans"
ON public.ocr_scans
FOR ALL
USING (true)
WITH CHECK (true);

-- Create policies for attendance_records
CREATE POLICY "Allow all operations on attendance_records"
ON public.attendance_records
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_ocr_scans_teacher_id ON public.ocr_scans(teacher_id);
CREATE INDEX idx_ocr_scans_scan_date ON public.ocr_scans(scan_date);
CREATE INDEX idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_attendance_records_scan_id ON public.attendance_records(scan_id);