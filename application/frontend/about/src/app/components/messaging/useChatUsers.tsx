"use client"; //FIX MESSAGE ORDER
//useChatUsers.tsx this file is used to fetch and manage chat users in the application
import { useEffect, useState } from "react";
import { useAPI } from "../../context/useAPI"; 
import { useAuth } from "../../context/AuthContext";

export function useChatUsers() {
  const { user } = useAuth();
  const { get } = useAPI();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    get("/users/") 
      .then((res) => {
        setUsers(res.data.filter((u: any) => u.user_id !== user.user_id));
      })
      .finally(() => setLoading(false));
  }, [user]);

  return { users, loading };
}
