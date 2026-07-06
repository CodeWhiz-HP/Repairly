"use client";
import { Button } from '@/components/Button'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import React, { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from "sonner"

const SignInContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error || 'Invalid email or password', { duration: 4000 });
                setLoading(false);
                return;
            }

            if (result?.ok) {
                toast.success('You have Signed In Successfully!!', { duration: 2000 });
                const callbackUrl = searchParams.get('callbackUrl') || '/';
                router.push(callbackUrl);
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred during sign in', { duration: 4000 });
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen w-full bg-deepCarbon flex justify-center items-center p-4'>
            <div style={{ width: '100%', maxWidth: '500px' }} className="bg-gunmetal border border-slateSteel rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-electricAqua to-transparent"></div>
                <div className="p-8">
                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-softGray">
                            Sign in
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-softGray uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-white/90" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    style={{ paddingLeft: '3rem' }} className="w-full bg-deepCarbon border focus:bg-deepCarbon border-slateSteel rounded py-3 pr-3   text-white focus:border-electricAqua outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-softGray uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-white/90" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '3rem' }} className="w-full bg-deepCarbon border border-slateSteel rounded py-3 pr-10   text-white focus:border-electricAqua outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ right: "16px" }}
                                    className="absolute top-1/2 -translate-y-1/2 text-softGray hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <a href="#" className="text-xs text-electricAqua hover:text-white transition-colors">Forgot Password?</a>
                        </div>
                        <Button type="submit" className="w-full mt-4" size="lg" disabled={loading}>
                            {loading ? 'Processing...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="pt-2 border-t border-slateSteel text-center">
                        <p className="text-sm mt-2 text-softGray">
                            <span>Don't have an account?   </span>
                            <Link href="/sign-up">
                                <span className="mk-12 text-electricAqua font-bold hover:text-white transition-colors">
                                    Sign Up
                                </span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen w-full bg-deepCarbon flex justify-center items-center p-4 text-softGray'>
                Loading sign in form...
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}