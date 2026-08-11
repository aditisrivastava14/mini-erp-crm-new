import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterInput } from '@gigflow/shared';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export const RegisterForm = () => {
  const registerAction = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerAction(data);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      // Error handled by axios interceptor
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Create an account</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Full Name</label>
        <div className="mt-1">
          <input
            {...register('name')}
            type="text"
            className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
          />
          {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Email address</label>
        <div className="mt-1">
          <input
            {...register('email')}
            type="email"
            className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
          />
          {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Password</label>
        <div className="mt-1">
          <input
            {...register('password')}
            type="password"
            className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
          />
          {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign up
        </Button>
      </div>

      <div className="text-sm text-center">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/login" className="font-medium text-primary hover:text-primary/80">
          Sign in
        </Link>
      </div>
    </form>
  );
};
