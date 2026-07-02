"use client";
import { register } from '@/actions/register';
import { Button } from '@/components/Button'
import { Mail, Lock, User as UserIcon, Building2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import React, { useActionState, useEffect, useState } from "react";
import { toast } from "sonner"

const SignUpPage = () => {
    
  const [state, formAction, pending] = useActionState(register, {success: null});
  const [targetRole, setTargetRole] = useState<'customer' | 'technician'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
  if (state.success === null) return;
  if (state.success) {
    toast.success("Account created successfully!");
    return;
  }
  toast.error(
    state.errors?.name?.[0] ||
    state.errors?.businessName?.[0] ||
    state.errors?.email?.[0] ||
    state.errors?.password?.[0] ||
    state.errors?.confirmPassword?.[0]
  );
}, [state]);


  return (
     <div className='min-h-screen bg-deepCarbon w-full flex justify-center items-center p-4'>
        <div style={{ width: '100%', maxWidth: '500px' }} className="bg-gunmetal border border-slateSteel rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-electricAqua to-transparent"></div>
            <div className="p-8">
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Create Account</h2>
                    <p className="text-softGray">
                        Join RepairLy as a {targetRole === 'technician' ? 'Professional Technician' : 'Customer'}
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex w-full bg-gunmetal rounded-lg p-1.5 mb-4 border border-slateSteel/50 shadow-inner gap-2">
                  <button 
                    type="button"
                    onClick={() => setTargetRole('customer')}
                    className={`flex-1 hover:cursor-pointer w-full flex items-center bg-deepCarbon justify-center text-sm font-semibold py-3 rounded-md transition-all duration-200 border ${targetRole === 'customer' ? 'bg-gunmetal text-electricAqua shadow-[0_0_10px_rgba(38,255,242,0.2)] border-electricAqua' : 'border-transparent text-softGray hover:bg-slateSteel/30 hover:text-white'}`}
                  >
                    Customer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTargetRole('technician')}
                    className={`flex-1 w-full hover:cursor-pointer flex items-center bg-deepCarbon justify-center text-sm font-semibold py-3 rounded-md transition-all duration-200 border ${targetRole === 'technician' ? 'bg-gunmetal text-electricAqua shadow-[0_0_10px_rgba(38,255,242,0.2)] border-electricAqua' : 'border-transparent text-softGray hover:bg-slateSteel/30 hover:text-white'}`}
                  >
                    Technician
                  </button>
                </div>

                <form action={formAction} className="space-y-2">
                    <input
                      type="hidden"
                      name="role"
                      value={targetRole === 'technician' ? 'Technician' : 'Customer'}
                    />
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-softGray uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-white/90" />
                            <input 
                                type="text" 
                                name="name" required
                                placeholder="Harshal Patle" 
                                style={{ paddingLeft: '3rem' }}
                                className="w-full bg-deepCarbon border border-slateSteel rounded py-3 pr-3 text-white focus:border-electricAqua outline-none transition-colors" 
                            />
                        </div>
                    </div>

                    {targetRole === 'technician' && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-softGray uppercase tracking-wider">Business Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-white/90" />
                                <input 
                                    type="text" 
                                    name="businessName"
                                    required
                                    placeholder="RepairLy Shop" 
                                    style={{ paddingLeft: '3rem' }} className="w-full bg-deepCarbon border border-slateSteel rounded py-3 pr-3   text-white focus:border-electricAqua outline-none transition-colors" 
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-softGray uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-white/90" />
                            <input 
                                type="email" 
                                name="email"
                                required
                                placeholder="you@example.com" 
                                style={{ paddingLeft: '3rem' }} className="w-full bg-deepCarbon border border-slateSteel rounded py-3 pr-3   text-white focus:border-electricAqua outline-none transition-colors" 
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
                                placeholder="••••••••" 
                                style={{ paddingLeft: '3rem' }} className="w-full bg-deepCarbon border border-slateSteel rounded py-3 pr-10   text-white focus:border-electricAqua outline-none transition-colors" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{right:"16px"}}
                                className="absolute top-1/2 -translate-y-1/2 text-softGray hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-softGray uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-white/90" />
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword"
                                required
                                placeholder="••••••••" 
                                style={{ paddingLeft: '3rem' }} className="w-full bg-deepCarbon border border-slateSteel rounded py-3 pr-10   text-white focus:border-electricAqua outline-none transition-colors" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{right:"16px"}}
                                className="absolute top-1/2 -translate-y-1/2 text-softGray hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full mt-4" size="lg" disabled={pending}>
                        {pending ? 'Processing...' : 'Create Account'}
                    </Button>
                </form>
                <div className="mt-2 border-t border-slateSteel text-center">
                    <p className="text-sm mt-2 text-softGray">
                        <span>Already have an account ?  </span>
                        <Link href="/sign-in" className="ml-2 mt-2 text-electricAqua font-bold hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
     </div>
  )
}

export default SignUpPage