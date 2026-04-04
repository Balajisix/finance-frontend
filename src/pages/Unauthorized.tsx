import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300">403</h1>
      <p className="mt-4 text-lg font-medium text-gray-700">Access denied</p>
      <p className="mt-1 text-sm text-gray-500">
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => navigate("/dashboard", { replace: true })}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
