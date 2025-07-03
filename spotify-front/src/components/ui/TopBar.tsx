import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboardIcon, LogOut, User, UserRound } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Topbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
      <div className="flex gap-2 items-center text-white font-semibold">
        <img src="/spotify.png" className="size-8" alt="Spotify logo" />
        Spotify
      </div>

      <div className="flex items-center gap-4">
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboardIcon className="size-4 mr-2" />
            Admin Dashboard
          </Link>
        )}

        {!isAuthenticated ? (
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-400 text-black font-semibold h-10 px-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
          >
            Log In
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-2 bg-zinc-800 hover:bg-zinc-700 text-white">
                <UserRound className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Topbar;
