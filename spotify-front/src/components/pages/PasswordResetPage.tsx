import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { usersApi } from "@/api/usersApi";
import { Music } from "lucide-react";

type FormInputs = {
  password: string;
  confirmPassword: string;
};

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isValidToken, setIsValidToken] = useState<null | boolean>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormInputs>();

  useEffect(() => {
    const validate = async () => {
      try {
        await usersApi.get(`/validate-token?token=${token}`);
        setIsValidToken(true);
      } catch {
        setIsValidToken(false);
      }
    };
    if (token) validate();
    else setIsValidToken(false);
  }, [token]);

  const onSubmit = async (data: FormInputs) => {
    try {
      await usersApi.post("/set-password", {
        token,
        password: data.password,
        passwordAgain: data.confirmPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full animate-pulse-slow">
              <Music className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2 animate-slide-up">
            Reset your password
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 ring-1 ring-white/5 rounded-2xl shadow-2xl p-8 animate-slide-up-delayed">
          {isValidToken === null ? (
            <p className="text-white text-center">Checking token...</p>
          ) : isValidToken === false ? (
            <p className="text-red-400 text-center">Invalid or expired token</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 h-12 px-4 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-white text-sm">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 h-12 px-4 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-700 text-black font-semibold h-12 rounded-full transition-all duration-300 hover:scale-105"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-8 animate-fade-in-late">
          <p className="text-zinc-400 text-sm">
            Back to{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-white underline hover:text-green-400 font-medium"
            >
              Login
            </button>
          </p>
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
        .animate-fade-in-late { animation: fade-in 0.6s ease-out 0.4s both; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PasswordResetPage;
