"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import "../../styles/login.css";
import { tpGrupoTapajos } from "@/assets";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/hooks/store";
import { setAuthenticated } from "@/hooks/slice/authSlice";

export default function LoginPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo]: any = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {

    if (accessToken) {
      try {
        setUserInfo(accessToken);
        dispatch(setAuthenticated(true));
      } catch (error) {
        console.error("Erro ao decodificar JWT:", error);
        dispatch(setAuthenticated(false));
      }
    }
  }, [accessToken, dispatch]);

  const handleLogin = () => {
    window.location.href = "https://sso.grupotapajos.com.br/logins";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="login-container">
        {isAuthenticated ? (
          <div>
            <h1>Bem-vindo, {userInfo?.nome}!</h1>
            <p>Email: {userInfo?.email}</p>
            <p>Username: {userInfo?.username}</p>
          </div>
        ) : (
          <form>
            <Image
              src={tpGrupoTapajos}
              alt="Login Logo"
              width={400}
              height={400}
            />
            <button
              type="button"
              className="login-button"
              onClick={handleLogin}
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
