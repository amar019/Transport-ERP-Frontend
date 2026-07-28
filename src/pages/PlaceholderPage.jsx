import { useLocation } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PlaceholderPage = () => {
  const location = useLocation();

  const getPageTitle = (path) => {
    const route = path.replace("/", "").replace("-", " ");
    if (!route) return "Module";
    return route
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full text-center shadow-sm space-y-6">
        <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto text-orange-500 shadow-inner">
          <Construction className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            ERP Module
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
            The <strong className="text-slate-700">{title}</strong> module is configured and ready for implementation. You can navigate between all sidebar sections seamlessly.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
