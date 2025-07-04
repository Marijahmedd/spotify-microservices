// src/components/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { usersApi } from "@/api/usersApi"; // your axios instance

// src/types/user.ts
export interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await usersApi.get("/check-auth");
        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>❌ Unauthorized or failed to load user.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p>
        👤 <strong>Email:</strong> {user.email}
      </p>
      <p>
        🆔 <strong>ID:</strong> {user.id}
      </p>
      <p>
        🛡️ <strong>Role:</strong> {user.role}
      </p>
    </div>
  );
};

export default Dashboard;
