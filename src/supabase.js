import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://sahbkmcrvjzfwqxjrvyc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaGJrbWNydmp6ZndxeGpydnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDEyNDUsImV4cCI6MjA5MjU3NzI0NX0.RCzs6k_TCHhXAA3KCD8quWK1j3zmiOEPk3b3Rg-6DRg"

export const supabase = createClient(supabaseUrl, supabaseKey)