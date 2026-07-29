import { useState } from 'react'
import { ArrowLeft, UserCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
})

type ProfileForm = z.infer<typeof schema>

const UpdateProfile = () => {
  const { user, setUser } = useUser()
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
    }
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      setApiError('')
      const res = await api.patch('/users/profile', data)
      setUser({ ...user!, name: res.data.name, email: res.data.email })
      setSuccess(true)
      setTimeout(() => navigate('/chatroom'), 2000)
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex items-center justify-center h-screen bg-[#0d0d0d]">
        
      <div className="bg-[#1a1a19] rounded-xl p-8 w-[450px]">
<button
            onClick={() => navigate('/chatroom')}
            className="flex items-center gap-2 text-[#888] hover:text-white text-[0.8rem] mb-6 cursor-pointer"
            >
            <ArrowLeft size={14} />
            Back to chat
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1d1649] text-[#a096eb] flex items-center justify-center text-xl font-bold mb-4">
            {initials}
          </div>
          <div className="text-[1.3rem] text-white font-bold">Your Profile</div>
          <div className="text-[0.8rem] text-[#888]">Update your name and email</div>
        </div>

        {success ? (
          <div className="text-center text-green-400 text-[0.85rem] mt-4">
            Profile updated successfully! Redirecting...
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="text-[0.8rem] text-left mb-1">Full Name</div>
              <input
                type="text"
                {...register('name')}
                className="w-full bg-[#2c2c2a] text-white text-[0.85rem] rounded-md px-3 py-2 border border-[#1f1f1e] focus:outline-none focus:border-[#6da7ec]"
              />
              {errors.name && <p className="text-red-400 text-[0.75rem] mt-1">{errors.name.message}</p>}
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-white text-[#242424] font-bold py-2 rounded-md hover:bg-[#f0f0f0] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default UpdateProfile