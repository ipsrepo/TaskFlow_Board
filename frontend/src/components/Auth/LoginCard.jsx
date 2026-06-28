import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Alert from '../UI/Alert';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import Input from '../UI/Input';

const LoginCard = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!formValues.email || !formValues.password) {
      setError('Enter your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await login(formValues.email, formValues.password);

    setIsSubmitting(false);

    if (response?.success) {
      navigate('/dashboard');
      return;
    }

    setError(response?.message || 'Incorrect email address or password.');
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary">Welcome back</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-[-0.05em] text-secondary sm:text-[36px]">Sign in to TaskBoard</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Access your projects, priorities, and team activity from one focused workspace.</p>
      </div>

      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <Input
          label="Email address"
          name="email"
          type="email"
          value={formValues.email}
          onChange={updateValue}
          placeholder="you@company.com"
          required
          autoComplete="email"
          inputClassName="h-11 rounded-lg"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={updateValue}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          showPasswordToggle
          inputClassName="h-11 rounded-lg"
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          icon={<Icon name="arrowRight" size={17} />}
          iconPosition="right"
          className="mt-1 h-11 rounded-lg"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        New to TaskBoard?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-primary-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginCard;
