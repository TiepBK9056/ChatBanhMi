"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value);
  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value);
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(event.target.value);
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      setFormError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Email không hợp lệ.");
      return;
    }

    setIsLoading(true);

    try {
      console.time("API Call");
      const response = await fetch("http://localhost:5130/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
        }),
      });
      console.timeEnd("API Call");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.message || errorData.error || "Đã xảy ra lỗi khi đăng ký.");
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log("Registration result:", result);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setIsLoading(false);

      console.time("Redirect");
      router.push(`/auth/confirmemail?email=${encodeURIComponent(email)}`);
      console.timeEnd("Redirect");
    } catch (error) {
      console.error("Registration error:", error);
      setFormError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Họ
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={handleLastNameChange}
            placeholder="Nhập họ của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Tên
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={handleFirstNameChange}
            placeholder="Nhập tên của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Nhập email của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            id="phoneNumber"
            type="text"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Nhập số điện thoại của bạn"
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
            onChange={handlePasswordChange}
            placeholder="Nhập mật khẩu của bạn"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;