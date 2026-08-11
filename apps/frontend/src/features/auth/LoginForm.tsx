import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '@gigflow/shared';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginForm = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      toast.success('Successfully logged in');
      navigate('/');
    } catch (error) {
      // Error is handled by axios interceptor toast
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Sign in to your account</h2>
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
          Sign in
        </Button>
      </div>

      <div className="text-sm text-center">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/register" className="font-medium text-primary hover:text-primary/80">
          Sign up
        </Link>
      </div>
    </form>
  );
};
