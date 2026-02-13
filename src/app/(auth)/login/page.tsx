import { login, signup } from '../actions'

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[var(--secondary)]/30">
            <form className="card w-full max-w-md flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center mb-4">Welcome Back</h2>

                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input id="email" name="email" type="email" required className="p-2 border rounded-md" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <input id="password" name="password" type="password" required className="p-2 border rounded-md" />
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <button formAction={login} className="btn btn-primary w-full">Log in</button>
                    <button formAction={signup} className="btn btn-secondary w-full">Sign up</button>
                </div>
            </form>
        </div>
    )
}
