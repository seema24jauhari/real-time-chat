import { MessageCircle } from 'lucide-react';


function ForgetPassword() {

  return (
    <>
      <div className='flex flex-col items-center justify-center h-screen'>
          <div className='mx-auto max-w-[1500] rounded-xl p-6 mx-auto h-[500px] w-[500px] bg-[#1a1a19]'>
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#032042] flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-5 h-5 text-[#6da7ec]" />
              </div>
              <div className='text-[1.3rem] text-[#fff] font-bold mb-[0.1rem]'>Welcome back</div>
              <div className='text-[0.8rem]'>Log in to keep chatting</div>
            </div>
            <div>
              <div>
                  <div className='text-[0.8rem] text-left mt-4'>Email</div> 
                  <div><input type="text" className='text-[0.9rem] w-full rounded-md p-[0.5rem] mt-1 focus:border-[#6da7ec] focus:outline-none focus:ring-0 bg-[#2c2c2a] border border-[#1f1f1e] text-[#fff]' placeholder='abc@gmail.com' /></div>
              </div>
              <div>
                  <div className='text-[0.8rem] text-left mt-4'>Password</div> 
                  <div><input type="password" className='text-[0.9rem] w-full rounded-md p-[0.5rem] focus:border-[#6da7ec] focus:outline-none focus:ring-0 bg-[#2c2c2a] border border-[#1f1f1e] text-[#fff]' placeholder='Enter your password' /></div>
                  <div className='text-[0.8rem] mt-1 text-right text-[#6da7ec]'>Forget Password?</div>
              </div>
              <div>
                  <button className='text-[0.9rem] w-full rounded-md p-[0.5rem] mt-4 bg-[#fff] text-[#242424] font-bold cursor-pointer hover:bg-[#f0f0f0]'>Log in</button>
              </div>
              <div className='text-[0.8rem] mt-4 text-center'>Don't have an account? <span className='text-[#6da7ec]'>Sign up</span></div>
              </div>
          </div>
      </div>
    </>
  )
}

export default ForgetPassword
