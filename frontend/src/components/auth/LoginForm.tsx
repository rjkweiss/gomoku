import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import './AuthForm.css';

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
    const { login } = useAuth();
    const [emailOrUsername, setEmailOrUsername] = useState<string>('');
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(emailOrUsername, password);
        } catch(err) {
            setError(err instanceof Error ? err.message: 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Login in to continue playing</p>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="emailOrUsername">Email or Username</label>
                    <input
                        id="emailOrUsername"
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="Enter your email or username"
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <div className="auth-switch">
                Don't have an account?{' '}
                <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={onSwitchToRegister}
                    disabled={isLoading}
                >
                    sign Up
                </button>
            </div>
        </div>
    )
};
