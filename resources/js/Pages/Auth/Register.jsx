import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id_no: '',
        last_name: '',
        birthdate: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    function submit(e) {
        e.preventDefault();

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(data.birthdate)) {
            toast.error("Birthdate must be in YYYY-MM-DD format.");
            return;
        }

        post('/register', {
            onSuccess: () => {
                reset('password');
                toast.success('Registration successful! Redirecting...');
            },
            onError: (err) => {
                if (err?.error) {
                    toast.error(err.error);
                }
            }
        });
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white shadow-sm border rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* Left Column */}
                <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-b from-blue-600 to-indigo-600 text-white p-10">
                    <img src="/favicon.png" alt="Logo" className="h-20 w-20 object-contain mb-6" />
                    <h2 className="text-4xl font-extrabold mb-2">Welcome to myOCC</h2>
                    <p className="text-ml">Register to create your account.</p>
                </div>

                {/* Right Column (Form) */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                    <div className="text-center md:hidden">
                        <img src="/favicon.png" alt="Logo" className="h-12 w-12 mx-auto object-contain" />
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">myOCC</h2>
                        <p className="mt-2 text-sm text-gray-600">Register to create your account</p>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        {/* General Error */}
                        {errors.error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {errors.error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* ID Number */}
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
                                    className="mt-1 uppercase placeholder:normal-case block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your ID Number"
                                />
                                {errors.user_id_no && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id_no}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    type="text"
                                    required
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Last Name"
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                )}
                            </div>

                            {/* Birthdate */}
                            <div>
                                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                                    Birthdate
                                </label>

                                <input
                                    id="birthdate"
                                    type="date"
                                    required
                                    max={new Date().toISOString().split("T")[0]} // Prevent future dates
                                    value={data.birthdate}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Strict YYYY-MM-DD regex
                                        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

                                        if (dateRegex.test(value)) {
                                            setData('birthdate', value);
                                        }
                                    }}
                                    onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
        transition duration-200"
                                />

                                {errors.birthdate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>
                                )}
                            </div>


                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter your Email"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Create New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
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
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Already have an account? Log in
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
