"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/hooks/slice/authSlice";

export default function TokenPage() {
  const dispatch = useDispatch();
  const router: any = useRouter();
 
  const token =
    router.query?.token ||
    (typeof window !== "undefined" &&
      window.location.pathname.split("/").pop());

  useEffect(() => {
  
    if (token) {
      try {
        const decodedToken: any = jwt.decode(token as string);

        dispatch(
          login({
            name: decodedToken.name,
            email: decodedToken.email,
            accessToken: token,
            profilePicture: decodedToken.foto_perfil_url,
          })
        );

     

        router.push("/");
      } catch (error) {
        console.error("Erro ao decodificar JWT:", error);
      }
    }
  }, [token, router]);

  return <>{/* Outros componentes ou conteúdo da página */}</>;
}
