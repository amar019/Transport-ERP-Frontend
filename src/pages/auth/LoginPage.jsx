import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginThunk } from "@/store/slices/authSlice";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Truck,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({ username: "", password: "" });

    let hasError = false;
    const newErrors = { username: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      hasError = true;
    }
    if (!password) {
      newErrors.password = "Password is required.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    dispatch(
      loginThunk({
        username,
        password,
      })
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center py-6 md:py-10 px-4 font-sans antialiased selection:bg-orange-100">
      {/* Center Card */}
      <div className="bg-white w-full max-w-[420px] p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-center my-auto">
        {/* Logo Centered */}
        <div className="flex flex-col items-center mb-4 select-none">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-2 rounded-lg shadow-md flex items-center justify-center">
              <Truck className="w-5 h-5 text-white transform -scale-x-100" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-lg tracking-tight text-slate-800">TRANSPORT</span>
              <span className="font-extrabold text-lg tracking-tight text-orange-500 ml-1">ERP</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
            Manage | Track | Deliver
          </p>
        </div>

        {/* Truck Illustration Banner */}
        <div className="w-full mb-4 rounded-xl overflow-hidden shadow-sm border border-slate-100/50">
          <img
            src="/Login/Truck-image.jpg"
            alt="Transport Truck Banner"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-5 relative">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 m-0">Welcome Back</h2>
          <div className="w-10 h-0.75 bg-orange-500 rounded-full mx-auto mt-2"></div>
          <p className="text-slate-400 text-xs mt-2.5">
            Sign in to manage your transport operations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Backend Errors */}
          {error && !fieldErrors.username && !fieldErrors.password && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start space-x-2.5 text-rose-600 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-medium text-left">{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
              Username
            </label>
            <div className="relative group">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 ${
                  fieldErrors.username || error
                    ? "text-rose-500"
                    : "group-focus-within:text-orange-500"
                } transition-colors`}
              >
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, username: "" }));
                }}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                  fieldErrors.username || error
                    ? "border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    : "border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p className="text-rose-600 text-[10px] font-semibold mt-1 text-left flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
              Password
            </label>
            <div className="relative group">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 ${
                  fieldErrors.password || error
                    ? "text-rose-500"
                    : "group-focus-within:text-orange-500"
                } transition-colors`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                  fieldErrors.password || error
                    ? "border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    : "border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
                  fieldErrors.password || error
                    ? "text-rose-400 hover:text-rose-600"
                    : "text-slate-400 hover:text-slate-600"
                } focus:outline-none cursor-pointer`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-rose-600 text-[10px] font-semibold mt-1 text-left flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs select-none">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-500 hover:text-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500/20 cursor-pointer accent-orange-500"
              />
              <span className="font-medium">Remember me</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => e.preventDefault()}
              className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#f97316] hover:bg-[#ea580c] active:bg-[#c2410c] text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed select-none transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden login-btn-container cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="login-btn-truck-loading">
                  <Truck className="w-5 h-5 text-white fill-white/10" strokeWidth={2} />
                </div>
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Logging in...</span>
                </span>
              </>
            ) : (
              <span className="relative z-10">Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
