import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, teacherId, className } = await req.json();
    
    console.log('Processing OCR request for teacher:', teacherId, 'class:', className);

    if (!imageBase64 || !teacherId || !className) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI with vision model for OCR
    console.log('Calling Lovable AI for OCR processing...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an OCR assistant for attendance sheets. IMPORTANT: Weekly attendance sheets may have MULTIPLE DATES across the top (columns). For EACH date found, extract all students attendance for that date. Format your response as follows:\n\nDATE: DD/MM/YYYY\n101 | John Doe | present\n102 | Jane Smith | absent\n\nDATE: DD/MM/YYYY\n101 | John Doe | late\n102 | Jane Smith | present\n\nIf a student has no mark for a date, mark them as "absent". Extract ALL dates you see at the top of the sheet.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract the attendance information from this handwritten sheet. List each student with their attendance status.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';
    console.log('Extracted text:', extractedText);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store OCR scan result
    const { data: scanData, error: scanError } = await supabase
      .from('ocr_scans')
      .insert({
        teacher_id: teacherId,
        class_name: className,
        extracted_text: extractedText,
      })
      .select()
      .single();

    if (scanError) {
      console.error('Error storing scan:', scanError);
      throw scanError;
    }

    console.log('Scan stored successfully:', scanData.id);

    // Parse the extracted text and store attendance records
    const lines = extractedText.split('\n').filter((line: string) => line.trim());
    const attendanceRecords = [];
    
    // Function to parse date string to YYYY-MM-DD format
    const parseDateString = (dateStr: string): string => {
      const dateParts = dateStr.split(/[\/\-]/);
      if (dateParts.length === 3) {
        let day = dateParts[0].padStart(2, '0');
        let month = dateParts[1].padStart(2, '0');
        let year = dateParts[2];
        
        // Handle different formats
        if (year.length === 2) {
          year = '20' + year;
        }
        
        // Check if format is MM/DD/YYYY or DD/MM/YYYY (assume DD/MM/YYYY for now)
        return `${year}-${month}-${day}`;
      }
      return new Date().toISOString().split('T')[0];
    };

    // Parse line by line, tracking current date
    let currentDate = new Date().toISOString().split('T')[0];
    
    for (const line of lines) {
      // Check if line contains a date
      const dateMatch = line.match(/DATE:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (dateMatch) {
        currentDate = parseDateString(dateMatch[1]);
        continue;
      }
      
      // Try to match format: RollNo | StudentName | Status
      const match = line.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(present|absent|late)/i);
      if (match) {
        const rollNo = match[1].trim();
        const studentName = match[2].trim();
        const status = match[3].toLowerCase();
        
        attendanceRecords.push({
          scan_id: scanData.id,
          student_id: rollNo,
          student_name: studentName,
          class_name: className,
          status: status,
          attendance_date: currentDate,
        });
      }
    }

    if (attendanceRecords.length > 0) {
      const { error: recordsError } = await supabase
        .from('attendance_records')
        .insert(attendanceRecords);

      if (recordsError) {
        console.error('Error storing attendance records:', recordsError);
        throw recordsError;
      }

      console.log(`Stored ${attendanceRecords.length} attendance records`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanId: scanData.id,
        extractedText,
        recordsCount: attendanceRecords.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-ocr function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});