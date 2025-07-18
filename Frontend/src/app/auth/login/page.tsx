"use client";

import React, { useEffect } from "react";
import LoginForm from "./login-form";
import SocialLoginButtons from "../components/SocialLoginButton";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const LoginPage = () => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // Nếu đã đăng nhập, chuyển hướng đến trang trước đó
  useEffect(() => {
    if (isLoggedIn) {
      const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/chat';
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  }, [isLoggedIn, router]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-gray-200 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {/* <FontAwesomeIcon icon={faArrowLeft} className="h-20 w-20" /> */}
          </button>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Đăng nhập</h1>
          <p className="text-center text-gray-600 mb-8">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-semibold">
              Đăng ký tại đây
            </Link>
          </p>
          <LoginForm />
          <div className="mt-6 text-center">
            <span className="text-gray-500">Hoặc đăng nhập bằng</span>
            <div className="h-4"></div>
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;