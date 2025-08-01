"use client"
import RegisterForm from '@/app/auth/register/register-form';
import Link from 'next/link';
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SocialLoginButtons from "../components/SocialLoginButton"; // Assuming this is the correct import, matching LoginPage's SocialLoginButtons

const RegisterPage = () => {
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
            {/* <FontAwesomeIcon icon={faArrowLeft} className="h-20 w-20" /> */} {/* Uncomment if using FontAwesome */}
          </button>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Đăng ký</h1>
          <p className="text-center text-gray-600 mb-8">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
              Đăng nhập tại đây
            </Link>
          </p>
          <RegisterForm />
          <div className="mt-6 text-center">
            <span className="text-gray-500">Hoặc đăng ký bằng</span>
            <div className="h-4"></div>
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;