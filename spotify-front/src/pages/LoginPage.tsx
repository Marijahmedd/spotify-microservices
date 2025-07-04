import { useForm } from "react-hook-form";
import { useUserStore } from "@/store/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff, Music } from "lucide-react";

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Your exact useUserStore and navigate logic would go here
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
      toast.success("Logged in successfully!");
      const role = useUserStore.getState().user?.role;
      if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Spotify Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full animate-pulse-slow">
              <Music className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2 animate-slide-up">
            Log in to Spotify
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 ring-1 ring-white/5 rounded-2xl shadow-2xl p-8 animate-slide-up-delayed">
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-white text-sm font-medium block"
              >
                Email or username
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email or username"
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 h-12 px-4 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-300 hover:border-zinc-600"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-400 text-sm animate-fade-in">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-white text-sm font-medium block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 h-12 px-4 pr-12 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-300 hover:border-zinc-600"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm animate-fade-in">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-700 disabled:cursor-not-allowed text-black font-semibold h-12 rounded-full transition-all duration-300 hover:scale-105 disabled:hover:scale-100 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Log In"
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  navigate("/forgot-password");
                }} // navigate("/forgot-password")
                className="text-zinc-400 text-sm underline hover:text-green-400 transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8 animate-fade-in-late">
          <p className="text-zinc-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => {
                navigate("/register");
              }} // navigate("/register")
              className="text-white underline hover:text-green-400 transition-colors duration-200 font-medium"
            >
              Sign up for Spotify
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.7s ease-out 0.2s both;
        }

        .animate-fade-in-late {
          animation: fade-in 0.6s ease-out 0.4s both;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
