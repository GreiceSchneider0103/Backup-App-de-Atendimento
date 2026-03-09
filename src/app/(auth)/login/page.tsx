import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="card" style={{ maxWidth: 480, margin: "48px auto" }}>
      <h1>Login interno</h1>
      <LoginForm />
    </section>
  );
}
