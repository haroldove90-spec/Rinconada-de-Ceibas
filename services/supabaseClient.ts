import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moffofwhuowgvchdxfay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZmZvZndodW93Z3ZjaGR4ZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjU5NzIsImV4cCI6MjA3OTYwMTk3Mn0.Lactb9hT-KJmqRd9cvjAHNG9LtQoyyuMp0xsuzP2_Ys';

export const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());