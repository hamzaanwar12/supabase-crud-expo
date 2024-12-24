// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="meals/index" 
        options={{ 
          headerTitle: "Our Menu",
          headerStyle: {
            backgroundColor: "#f5f5f5",
          },
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="meals/[id]" 
        options={{ 
          headerTitle: "Meal Details",
          headerStyle: {
            backgroundColor: "#f5f5f5",
          },
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}