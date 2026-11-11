import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AuthValue = { user: User | null | undefined };
const AuthContext = createContext<AuthValue>({ user: undefined });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (active) setUser(error ? null : data.user);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null);
      void router.invalidate();
      if (event === "SIGNED_OUT") {
        void queryClient.cancelQueries().then(() => queryClient.clear());
      } else {
        void queryClient.invalidateQueries();
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);