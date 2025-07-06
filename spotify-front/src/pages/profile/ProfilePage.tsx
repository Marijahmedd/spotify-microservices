import { useEffect, useState } from "react";
import { usersApi } from "@/api/usersApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

const ProfilePage = () => {
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

  return (
    <div className="h-full bg-black">
      <ScrollArea className="h-full">
        <div className="relative min-h-full">
          {/* Spotify-style gradient background */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#1db954]/20 via-[#191414] to-[#121212] pointer-events-none"
            aria-hidden="true"
          />

          {/* Main Content */}
          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-6xl font-black text-white tracking-tight">
                Profile
              </h1>
            </div>

            {loading ? (
              <div className="space-y-6">
                <div className="bg-[#181818] rounded-lg p-6 space-y-4">
                  <Skeleton className="h-8 w-32 bg-[#282828]" />
                  <Skeleton className="h-6 w-64 bg-[#282828]" />
                  <Skeleton className="h-6 w-48 bg-[#282828]" />
                  <Skeleton className="h-6 w-40 bg-[#282828]" />
                </div>
              </div>
            ) : user ? (
              <div className="bg-[#181818] rounded-lg p-8 max-w-2xl hover:bg-[#282828] transition-colors duration-200">
                <div className="space-y-8">
                  {/* User Info Grid */}
                  <div className="grid gap-6">
                    {/* Email */}
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center group-hover:bg-[#1db954] transition-colors">
                        <Mail className="w-5 h-5 text-[#b3b3b3] group-hover:text-black" />
                      </div>
                      <div>
                        <p className="text-[#b3b3b3] text-sm font-medium uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-white text-lg font-semibold">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center group-hover:bg-[#1db954] transition-colors">
                        <Shield className="w-5 h-5 text-[#b3b3b3] group-hover:text-black" />
                      </div>
                      <div>
                        <p className="text-[#b3b3b3] text-sm font-medium uppercase tracking-wide">
                          Role
                        </p>
                        <p className="text-white text-lg font-semibold capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center gap-4 group">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          user.isVerified
                            ? "bg-[#1db954] group-hover:bg-[#1ed760]"
                            : "bg-[#282828] group-hover:bg-[#e22134]"
                        }`}
                      >
                        {user.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-black" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#b3b3b3] group-hover:text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#b3b3b3] text-sm font-medium uppercase tracking-wide">
                          Account Status
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            user.isVerified
                              ? "text-[#1db954]"
                              : "text-[#e22134]"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-4 border-t border-[#282828]">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        user.isVerified
                          ? "bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30"
                          : "bg-[#e22134]/20 text-[#e22134] border border-[#e22134]/30"
                      }`}
                    >
                      {user.isVerified ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {user.isVerified
                        ? "Account Verified"
                        : "Account Needs Verification"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#181818] rounded-lg p-8 max-w-2xl border border-[#e22134]/30">
                <div className="flex items-center gap-4 text-[#e22134]">
                  <div className="w-10 h-10 bg-[#e22134]/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      Unable to load profile
                    </p>
                    <p className="text-[#b3b3b3] text-sm">
                      Please check your connection and try again
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfilePage;
