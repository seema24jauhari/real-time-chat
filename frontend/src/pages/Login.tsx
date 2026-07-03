import { MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import api from '../api/axios'


const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const navigate = useNavigate()
    const [apiError, setApiError] = useState('')

    const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post('/auth/login', data, { withCredentials: true });
      const result = await res.data;
      if (result.error) {
        if (res.status === 401) {
          setApiError('Invalid email or password')
        } else {
          setApiError(result.message || 'Something went wrong')
        }
      }
      else{
        localStorage.setItem("token", result.token);
        navigate("/chatroom");    
      }
    } catch (err) {
      console.log(err);
      setApiError('Something went wrong. Please try again.')
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mx-auto max-w-[1500] rounded-xl p-6 mx-auto min-h-[500px] w-[500px] bg-[#1a1a19]">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#032042] flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-5 h-5 text-[#6da7ec]" />
            </div>
            <div className="text-[1.3rem] text-[#fff] font-bold mb-[0.1rem]">
              Welcome back
            </div>
            <div className="text-[0.8rem]">Log in to keep chatting</div>
          </div>
          <div>
            <div>
              <div className="text-[0.8rem] text-left mt-4">Email</div>
              <input
                type="text"
                {...register("email")}
                className="text-[0.9rem] w-full rounded-md p-[0.5rem] mt-1 focus:border-[#6da7ec] focus:outline-none focus:ring-0 bg-[#2c2c2a] border border-[#1f1f1e] text-[#fff]"
                placeholder="abc@gmail.com"
              />
              {errors.email && (
                <p className="text-red-400 text-[0.75rem] mt-1 text-right">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <div className="text-[0.8rem] text-left mt-4">Password</div>
              <input
                type="password"
                {...register("password")}
                className="text-[0.9rem] w-full rounded-md p-[0.5rem] focus:border-[#6da7ec] focus:outline-none focus:ring-0 bg-[#2c2c2a] border border-[#1f1f1e] text-[#fff]"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-400 text-[0.75rem] mt-1 text-right">
                  {errors.password.message}
                </p>
              )}
              <div className="text-[0.8rem] mt-1 text-right text-[#6da7ec]">
                Forget Password?
              </div>
            </div>
            <div>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="text-[0.9rem] w-full rounded-md p-[0.5rem] mt-4 bg-[#fff] text-[#242424] font-bold cursor-pointer hover:bg-[#f0f0f0] disabled:opacity-50"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
              {apiError && (
                <p className="text-red-400 text-[0.75rem] mt-3 text-center">{apiError}</p>
              )}
            </div>
            <div className="text-[0.8rem] mt-4 text-center">
              Don't have an account?
              <Link to="/register" className="text-[#6da7ec] ml-1">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
