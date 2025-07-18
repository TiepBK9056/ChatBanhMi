"use client";

import React, { useState } from "react";
import SocialLogin from "@/app/auth/components/SocialLoginButton";

function RegisterForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            window.location.href = `/auth/confirmemail?email=${encodeURIComponent(email)}`;
            console.timeEnd("Redirect");
        } catch (error) {
            console.error("Registration error:", error);
            setFormError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
            setIsLoading(false);
        }
    };

    return (
        <div id="login" className="section">
            <form onSubmit={handleSubmit}>
                <div className="form-signup clearfix">
                    {formError && <div style={{ color: "red" }}>{formError}</div>}
                    <div className="row">
                        <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                            <fieldset className="form-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={lastName}
                                    onChange={handleLastNameChange} // Đã sửa
                                    name="lastName"
                                    id="lastName"
                                    placeholder="Họ"
                                    required
                                />
                            </fieldset>
                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                            <fieldset className="form-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={firstName}
                                    onChange={handleFirstNameChange} // Đã sửa
                                    name="firstName"
                                    id="firstName"
                                    placeholder="Tên"
                                    required
                                />
                            </fieldset>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                            <fieldset className="form-group">
                                <input
                                    type="email"
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$"
                                    className="form-control form-control-lg"
                                    value={email}
                                    onChange={handleEmailChange}
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    required
                                />
                            </fieldset>
                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                            <fieldset className="form-group">
                                <input
                                    placeholder="Số điện thoại"
                                    type="text"
                                    pattern="\d+"
                                    className="form-control form-control-comment form-control-lg"
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                    name="PhoneNumber"
                                    required
                                />
                            </fieldset>
                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                            <fieldset className="form-group">
                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    name="password"
                                    id="password"
                                    placeholder="Mật khẩu"
                                    required
                                />
                            </fieldset>
                        </div>
                    </div>
                    <div className="section">
                        <button 
                            type="submit" 
                            className="btn btn-style btn_50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Đăng ký"}
                        </button>
                    </div>
                </div>
            </form>
            <SocialLogin />

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
                        zIndex: 9999
                    }}
                >
                    <div 
                        style={{
                            width: "50px",
                            height: "50px",
                            border: "5px solid #f3f3f3",
                            borderTop: "5px solid #3498db",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                        }}
                    />
                </div>
            )}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default RegisterForm;