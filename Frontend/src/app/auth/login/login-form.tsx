"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [showRecoverForm, setShowRecoverForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recoverFormRef = useRef<HTMLDivElement>(null);
  const [recoverFormHeight, setRecoverFormHeight] = useState(0);

  useEffect(() => {
    if (recoverFormRef.current) {
      setRecoverFormHeight(recoverFormRef.current.scrollHeight);
    }
  }, [showRecoverForm]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/chat";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectUrl);
    } catch {
      setFormError("Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!recoverEmail) {
      setFormError("Vui lòng nhập email để khôi phục mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: recoverEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.message || "Gửi yêu cầu khôi phục thất bại.");
        setIsLoading(false);
        return;
      }

      alert("Yêu cầu khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra email.");
      setRecoverEmail("");
      setShowRecoverForm(false);
    } catch (error) {
      console.error("Recover error:", error);
      setFormError("Đã xảy ra lỗi khi gửi yêu cầu khôi phục. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecoverForm = () => {
    setShowRecoverForm(!showRecoverForm);
    setFormError("");
  };

  const recoverFormStyle = {
    height: showRecoverForm ? `${recoverFormHeight}px` : "0px",
    overflow: "hidden",
    transition: "height 0.3s ease-in-out",
  };

  return (
    <div className="space-y-6">
      {/* Form Đăng nhập */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && !showRecoverForm && (
          <p className="text-red-500 text-sm text-center">{formError}</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <button
            type="button"
            onClick={handleToggleRecoverForm}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Quên mật khẩu?
          </button>
        </div>
      </form>

      {/* Form Khôi phục mật khẩu */}
      <div style={recoverFormStyle} ref={recoverFormRef}>
        <form onSubmit={handleRecoverSubmit} className="space-y-6">
          {formError && showRecoverForm && (
            <p className="text-red-500 text-sm text-center">{formError}</p>
          )}
          <div>
            <label htmlFor="recover-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email khôi phục
            </label>
            <input
              id="recover-email"
              type="email"
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
              placeholder="Nhập email để khôi phục"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Lấy lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;