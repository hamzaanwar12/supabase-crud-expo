// app/_layout.tsx
import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // return () => {
    //   subscription?.unsubscribe();
    // };
  }, []);

  if (loading) {
    // Optionally, show a loading indicator while checking authentication
    return null;
  }

  if (!session) {
    // Redirect to /auth if the user is not logged in
    return <Redirect href="/auth" />;
  }

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
