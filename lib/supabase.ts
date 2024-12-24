import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://bzvvviieilinxiihzpks.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_API_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dnZ2aWllaWxpbnhpaWh6cGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5OTkyNjYsImV4cCI6MjA1MDU3NTI2Nn0.EQPn4uM98NbELmBC_xNc9xYNPVWeJjlDjiH-WR5yfnw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
