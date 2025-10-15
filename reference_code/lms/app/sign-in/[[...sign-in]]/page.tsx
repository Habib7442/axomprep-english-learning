import { SignIn } from '@clerk/nextjs'

const SignInPage = () => {
  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100">
        <SignIn appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none"
          }
        }} />
    </main>
  );
};

export default SignInPage;