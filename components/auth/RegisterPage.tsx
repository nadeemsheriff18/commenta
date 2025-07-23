// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import AppHeader from "@/components/layout/AppHeader";
// import { Loader2, Check, X, Chrome } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { authService } from "@/lib/auth";
// import { toast } from "sonner";

// interface RegisterPageProps {
//   onRegister: (
//     name: string,
//     email: string,
//     password: string
//   ) => Promise<boolean>;
//   onSwitchToLogin: () => void;
//   isLoading?: boolean;
// }

// export default function RegisterPage({
//   onRegister,
//   onSwitchToLogin,
//   isLoading = false,
// }: RegisterPageProps) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);

//   const passwordRequirements = [
//     { text: "At least 8 characters", met: password.length >= 8 },
//     { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
//     { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
//     { text: "Contains number", met: /\d/.test(password) },
//   ];

//   const allRequirementsMet = passwordRequirements.every((req) => req.met);
//   const passwordsMatch = password === confirmPassword;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (name && email && password && allRequirementsMet && passwordsMatch) {
//       setIsSubmitting(true);
//       await onRegister(name, email, password);
//       setIsSubmitting(false);
//     }
//   };

//   const handleGoogleRegister = async () => {
//     setIsGoogleLoading(true);
//     try {
//       const result = await authService.initiateGoogleAuth();

//       if (result.success && result.url) {
//         // Redirect to Google OAuth
//         window.location.href = result.url;
//       } else {
//         toast.error(result.message || "Failed to initiate Google registration");
//       }
//     } catch (error) {
//       toast.error("Failed to initiate Google registration");
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AppHeader showAuthButtons={true} onLoginClick={onSwitchToLogin} />
//       <div className="flex items-center justify-center p-4 pt-20">
//         <Card className="w-full max-w-md">
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl font-bold text-center">
//               Create Account
//             </CardTitle>
//             <CardDescription className="text-center">
//               Sign up to get started with your projects
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Full Name</Label>
//                 <Input
//                   id="name"
//                   type="text"
//                   placeholder="Enter your full name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   disabled={isSubmitting || isLoading}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={isSubmitting || isLoading}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Create a password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   disabled={isSubmitting || isLoading}
//                   required
//                 />
//                 {password && (
//                   <div className="mt-2 space-y-1">
//                     {passwordRequirements.map((requirement, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center space-x-2 text-sm"
//                       >
//                         {requirement.met ? (
//                           <Check className="h-4 w-4 text-green-600" />
//                         ) : (
//                           <X className="h-4 w-4 text-red-500" />
//                         )}
//                         <span
//                           className={cn(
//                             requirement.met ? "text-green-600" : "text-red-500"
//                           )}
//                         >
//                           {requirement.text}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   placeholder="Confirm your password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   disabled={isSubmitting || isLoading}
//                   required
//                 />
//                 {password && confirmPassword && (
//                   <div className="flex items-center space-x-2 text-sm">
//                     {passwordsMatch ? (
//                       <>
//                         <Check className="h-4 w-4 text-green-600" />
//                         <span className="text-green-600">Passwords match</span>
//                       </>
//                     ) : (
//                       <>
//                         <X className="h-4 w-4 text-red-500" />
//                         <span className="text-red-500">
//                           Passwords do not match
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={
//                   isSubmitting ||
//                   isLoading ||
//                   !allRequirementsMet ||
//                   !passwordsMatch ||
//                   !name ||
//                   !email
//                 }
//               >
//                 {isSubmitting || isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating Account...
//                   </>
//                 ) : (
//                   "Create Account"
//                 )}
//               </Button>

//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <span className="w-full border-t" />
//                 </div>
//                 <div className="relative flex justify-center text-xs uppercase">
//                   <span className="bg-white px-2 text-muted-foreground">
//                     Or continue with
//                   </span>
//                 </div>
//               </div>

//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full"
//                 onClick={handleGoogleRegister}
//                 disabled={isSubmitting || isLoading || isGoogleLoading}
//               >
//                 {isGoogleLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Connecting to Google...
//                   </>
//                 ) : (
//                   <>
//                     <Chrome className="mr-2 h-4 w-4" />
//                     Continue with Google
//                   </>
//                 )}
//               </Button>
//             </form>
//             <div className="mt-4 text-center">
//               <p className="text-sm text-muted-foreground">
//                 Already have an account?{" "}
//                 <button
//                   onClick={onSwitchToLogin}
//                   className="text-primary hover:underline font-medium"
//                   disabled={isSubmitting || isLoading}
//                 >
//                   Sign in
//                 </button>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
