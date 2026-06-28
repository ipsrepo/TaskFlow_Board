import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Alert from '../UI/Alert';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import Input from '../UI/Input';

const RegisterCard = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = 'Your full name is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (formValues.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (formValues.password !== formValues.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    const response = await register(formValues.name.trim(), formValues.email, formValues.password);

    setIsSubmitting(false);

    if (response?.success) {
      navigate('/dashboard');
      return;
    }

    setApiError(response?.message || 'Registration failed. Please try again.');
  };

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold text-primary">Create your workspace</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-[-0.05em] text-secondary sm:text-[36px]">Get started with TaskBoard</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Create an account and bring every project, task, and conversation into one place.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}

        <Input
          label="Full name"
          name="name"
          value={formValues.name}
          onChange={updateValue}
          placeholder="Your name"
          error={errors.name}
          required
          autoComplete="name"
          inputClassName="h-10 rounded-lg"
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          value={formValues.email}
          onChange={updateValue}
          placeholder="you@company.com"
          error={errors.email}
          required
          autoComplete="email"
          inputClassName="h-10 rounded-lg"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={updateValue}
          placeholder="At least 6 characters"
          error={errors.password}
          required
          autoComplete="new-password"
          showPasswordToggle
          inputClassName="h-10 rounded-lg"
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={formValues.confirmPassword}
          onChange={updateValue}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          showPasswordToggle
          inputClassName="h-10 rounded-lg"
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
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterCard;
