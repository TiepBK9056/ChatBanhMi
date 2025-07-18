"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import React, { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/Auth/ConfirmEmail/ComfirmEmail.module.css";
import Image from "next/image";


const ConfirmEmailPage = () => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "Email không xác định";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInput = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) {
      e.target.value = "";
      return;
    }
    if (value.length === 1 && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const getOTP = () => {
    return otpRefs.current.map((input) => input?.value || "").join("");
  };

  const clearOTPInputs = () => {
    otpRefs.current.forEach((input) => {
      if (input) input.value = "";
    });
    otpRefs.current[0]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otp = getOTP();
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5130/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: decodeURIComponent(email),
          otp: otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Xác thực OTP thất bại");
        clearOTPInputs();
        throw new Error(errorData.message || "Xác thực OTP thất bại");
      }

      const result = await response.json();
      setSuccess(true);
      console.log("Verification successful:", result);
      setTimeout(() => {
        window.location.href = "/auth/login?verified=true";
      }, 1000);
    } catch (err) {
      const error = err as Error;
      if (!error.message.includes("OTP không hợp lệ")) {
        setError(error.message || "Đã xảy ra lỗi khi xác thực OTP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5130/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: decodeURIComponent(email),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gửi lại OTP thất bại");
      }

      alert("OTP đã được gửi lại thành công");
      clearOTPInputs();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Đã xảy ra lỗi khi gửi lại OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["main-cofirm-email"]}>
      <div className={styles.steps}>
        <div className={`${styles.step} ${styles["step-active"]}`}>
          <div className={styles["step-circle"]}>1</div>
          Điền thông tin
        </div>
        <div className={`${styles.step} ${styles["step-active"]}`}>
          <div className={styles["step-circle"]}>2</div>
          Xác nhận Email
        </div>
        <div className={styles.step}>
          <div className={styles["step-circle"]}>✓</div>
          Hoàn thành
        </div>
      </div>
      <div className={styles.container}>
        <FontAwesomeIcon className={styles["faArrowLeft"]} icon={faArrowLeft} />
        <h1>Nhập mã xác nhận</h1>
        <p className={styles["otp-description"]}>Mã xác thực sẽ được gửi qua email đến</p>
        <p
          className={styles.number}
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <Image
            src="/images/gmailIcon.svg"
            width={20}
            height={20}
            style={{ marginRight: "10px" }}
            alt="Gmail Icon"
          />
          {decodeURIComponent(email)}
        </p>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {success && (
          <p style={{ color: "green", textAlign: "center" }}>
            Xác thực thành công! Đang chuyển hướng...
          </p>
        )}

        <div className={styles["otp-input-container"]}>
          {Array.from({ length: 6 }, (_, index) => (
            <input
              key={index}
              type="text"
              className={styles["otp-input"]}
              id={`otp${index + 1}`}
              maxLength={1}
              disabled={isLoading}
              ref={(el) => {
                otpRefs.current[index] = el;
              }}
              onChange={handleInput(index)}
              onKeyDown={handleKeyDown(index)}
            />
          ))}
        </div>

        <div className={styles["resend-otp"]}>
          Bạn vẫn chưa nhận được?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleResendOTP();
            }}
          >
            Gửi lại
          </a>{" "}
          hoặc thử <a href="#">Các phương thức khác</a>
        </div>

        <button
          className={styles["next-button"]}
          onClick={handleVerifyOTP}
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Kế tiếp"}
        </button>

        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div className="spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;