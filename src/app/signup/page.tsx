"use client";
import axios from "axios";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaUserCog, FaUserTie } from "react-icons/fa";
import { FiMail, FiLock, FiArrowRight, FiCheck } from "react-icons/fi";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setuserName] = useState("");
  const [roleModal, setRoleModal] = useState(true); // Default role
  const [role, setRole] = useState("freelancer"); // Default role

  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        email,
        password,
        username: userName,
        role:role
      });

      if (!res.data) {
        setError("Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
    setRoleModal(true);
},[])

  const passwordRequirements = [
    { id: 1, text: "At least 6 characters", meets: password.length >= 6 },
  ];

  return (
    <div className="min-h-screen relative bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl  dark:shadow-gray-500 dark:border-t-2  overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2">
                Create Account
              </h1>
              <p className="text-gray-500">Join us to get started</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3  flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 dark:text-gray-200" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-black border dark:text-gray-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-1">
                  UserName
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 dark:text-gray-200" />
                  </div>
                  <input
                    type="text"
                    placeholder="you001"
                    value={userName}
                    onChange={(e) => setuserName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-black border dark:text-gray-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 dark:text-gray-200" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-black border dark:text-gray-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center text-xs text-gray-500 "
                    >
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 mr-2 rounded-full ${
                          req.meets
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {req.meets ? <FiCheck size={10} /> : null}
                      </span>
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 dark:text-gray-200" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-black border dark:text-gray-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent dark:text-gray-900 rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${
                  isLoading ? "opacity-80" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Register <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center text-foreground justify-center bg-black/30 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-background rounded-lg shadow-lg  w-full max-w-md ">
            <div className="pt-4 text-center">
              <p className="text-slate-600 font-semibold">
                Please choose your role to continue registration.
              </p>
            </div>
            <div className="bg-background flex  rounded-lg shadow-lg p-6 w-full justify-center gap-10 max-w-md ">
              <div
                className="border-4 border-primary rounded-2xl px-6 p-4 hover:bg-blue-100 dark:hover:bg-accent  transition duration-300 ease-in-out cursor-pointer"
                onClick={() => {
                  setRole("Freelancer");
                  setRoleModal(false);
                }}
              >
                <FaUserCog size={100} />
                <p className="text-xl font-bold">Freelancer</p>
              </div>
              <div
                className="border-4 border-primary rounded-2xl p-4 px-6 hover:bg-blue-100  dark:hover:bg-accent transition duration-300 ease-in-out cursor-pointer"
                onClick={() => {
                  setRole("Client");
                setRoleModal(false);
                }}
              >
                <FaUserTie size={100} />
                <p className="text-xl font-bold pl-5 pt-1">Client</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
