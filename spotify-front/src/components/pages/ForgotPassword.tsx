import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/api/usersApi";

type ForgotPasswordInputs = {
  email: string;
};

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      await usersApi.post("/forgot-password", { email: data.email });
      toast.success("Reset link sent! Check your inbox.");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full animate-pulse-slow">
              <Music className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2 animate-slide-up">
            Forgot Password
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 ring-1 ring-white/5 rounded-2xl shadow-2xl p-8 animate-slide-up-delayed">
          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-white text-sm font-medium block"
                >
                  Enter your email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-700 disabled:cursor-not-allowed text-black font-semibold h-12 rounded-full transition-all duration-300 hover:scale-105 disabled:hover:scale-100 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
                    Sending link...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-zinc-400 text-sm underline hover:text-green-400 transition-colors duration-200"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-fade-in">
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Check your email
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  We’ve sent you a reset link. Click it to reset your password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 w-full bg-green-500 hover:bg-green-400 text-black font-semibold h-12 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.7s ease-out; }
        .animate-slide-up-delayed { animation: slide-up 0.7s ease-out 0.2s both; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
