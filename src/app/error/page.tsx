export default function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-[var(--muted)] mb-4">Sorry, we couldn't authenticate you. Please try again.</p>
            <a href="/login" className="btn btn-primary">Go back to Login</a>
        </div>
    )
}
