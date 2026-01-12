import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        user_id_no: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white shadow-xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* Left Column (Illustration / Info) */}
                <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-b from-blue-600 to-indigo-600 text-white p-10">
                    <img src="/favicon.png" alt="Logo" className="h-20 w-20 object-contain mb-6" />
                    <h2 className="text-4xl font-extrabold mb-2">Welcome to myOCC</h2>
                    <p className="text-ml">Sign in to access your account.</p>
                </div>

                {/* Right Column (Form) */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="text-center md:hidden">
                        <img src="/favicon.png" alt="Logo" className="h-12 w-12 mx-auto object-contain" />
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">myOCC</h2>
                        <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        {errors.error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {errors.error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="user_id_no" className="block text-sm font-medium text-gray-700">
                                    ID Number
                                </label>
                                <input
                                    id="user_id_no"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={data.user_id_no}
                                    onChange={e => setData('user_id_no', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your ID Number"
                                />
                                {errors.user_id_no && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id_no}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
