"use client"; // Đánh dấu component này là Client Component
import Image from "next/image";
import React from "react";

interface Params {
  [key: string]: string | number | boolean | null | undefined; // Kiểu dữ liệu cho object a
}

const SocialLoginButtons = () => {
  const loginFacebook = () => {
    const a = {
      client_id: "947410958642584",
      redirect_uri: "https://store.mysapo.net/account/facebook_account_callback",
      state: JSON.stringify({ redirect_url: window.location.href }),
      scope: "email",
      response_type: "code",
    };
    const b = "https://www.facebook.com/v3.2/dialog/oauth" + encodeURIParams(a, true);
    window.location.href = b;
  };

  const loginGoogle = () => {
    const a = {
      client_id: "997675985899-pu3vhvc2rngfcuqgh5ddgt7mpibgrasr.apps.googleusercontent.com",
      redirect_uri: "https://store.mysapo.net/account/google_account_callback",
      scope: "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      access_type: "online",
      state: JSON.stringify({ redirect_url: window.location.href }),
      response_type: "code",
    };
    const b = "https://accounts.google.com/o/oauth2/v2/auth" + encodeURIParams(a, true);
    window.location.href = b;
  };

  const encodeURIParams = (a: Params, b: boolean): string => {
    const c: string[] = [];
    for (const d in a) {
      if (a.hasOwnProperty(d)) {
        const e = a[d];
        if (e != null) {
          c.push(encodeURIComponent(d) + "=" + encodeURIComponent(e));
        }
      }
    }
    return c.length === 0 ? "" : (b ? "?" : "") + c.join("&");
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <p className="text-gray-600"></p>
      {/* Nút Facebook */}
      <a
        href="javascript:void(0)"
        className="social-login--facebook"
        style={{ marginRight: "10px" }}
        onClick={loginFacebook}
      >
        <Image
          src="http://bizweb.dktcdn.net/assets/admin/images/login/fb-btn.svg"
          alt="facebook-login-button"
          width={129}
          height={37}
        />
      </a>
      {/* Nút Google */}
      <a
        href="javascript:void(0)"
        className="social-login--google"
        onClick={loginGoogle}
      >
        <Image
          src="http://bizweb.dktcdn.net/assets/admin/images/login/gp-btn.svg"
          alt="google-login-button"
          width={129}
          height={37}
        />
      </a>
    </div>
  );
};

export default SocialLoginButtons;