import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (<><h1>Create account</h1><Suspense><AuthForm mode="register" /></Suspense></>);
}
