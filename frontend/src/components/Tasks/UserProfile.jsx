import { useEffect, useState } from 'react';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import Alert from '../UI/Alert';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import { format } from 'date-fns';

const roleVariants = {
  admin: 'danger',
  lead: 'warning',
  member: 'primary',
};

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileValues, setProfileValues] = useState({
    name: '',
    email: '',
  });
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfileValues({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  const startEditing = () => {
    setProfileValues({
      name: user?.name || '',
      email: user?.email || '',
    });

    setFeedback(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setProfileValues({
      name: user?.name || '',
      email: user?.email || '',
    });

    setIsEditing(false);
    setFeedback(null);
  };

  const getMemberSince = (createdAt) => {
    if (!createdAt) {
      return 'Member since joining';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return 'Member since joining';
    }

    return `Member since ${format(date, 'MMMM yyyy')}`;
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    const name = profileValues.name.trim();
    const email = profileValues.email.trim().toLowerCase();

    if (!name) {
      setFeedback({
        type: 'error',
        message: 'Your name is required.',
      });
      return;
    }

    if (!email) {
      setFeedback({
        type: 'error',
        message: 'Your email address is required.',
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const { data } = await api.put('/users/profile', {
        name,
        email,
      });

      if (!data.success) {
        throw new Error(data.message || 'Unable to update profile.');
      }

      const updatedUser =
          data.user ||
          data.data?.user ||
          data.data;

      if (updatedUser?._id) {
        updateUser(updatedUser);
      }

      setIsEditing(false);

      setFeedback({
        type: 'success',
        message: 'Profile updated successfully.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
            error.response?.data?.message ||
            error.message ||
            'Unable to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <div className="page-container max-w-5xl space-y-6">
        <header className="border-b border-line pb-6">
          <p className="section-label">Account</p>

          <h1 className="page-title mt-1">My profile</h1>

          <p className="page-subtitle">
            View and update your account information.
          </p>
        </header>

        {feedback && (
            <Alert
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback(null)}
                autoClose={4000}
            />
        )}

        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <Avatar user={user} size="xl" showStatus />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-bold text-secondary sm:text-2xl">
                    {user?.name || 'Workspace user'}
                  </h2>

                  <Badge
                      variant={roleVariants[user?.role] || 'secondary'}
                      size="sm"
                  >
                    {user?.role || 'member'}
                  </Badge>
                </div>

                <p className="mt-1 text-sm text-muted">
                  {getMemberSince(user?.createdAt)}
                </p>
              </div>
            </div>

            {!isEditing && (
                <Button
                    variant="outline"
                    onClick={startEditing}
                    icon={<Icon name="edit" size={16} />}
                >
                  Edit profile
                </Button>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-7">
            <div>
              <p className="text-sm font-semibold text-secondary">
                Account details
              </p>

              <p className="mt-0.5 text-xs text-muted">
                Your personal workspace information.
              </p>
            </div>

            {isEditing && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary">
            <Icon name="edit" size={13} />
            Editing
          </span>
            )}
          </div>

          {isEditing ? (
              <form onSubmit={saveProfile}>
                <div className="divide-y divide-line">
                  <div className="px-6 py-5 sm:px-7">
                    <Input
                        label="Full name"
                        value={profileValues.name}
                        onChange={(event) =>
                            setProfileValues((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                        }
                        placeholder="Enter your full name"
                        required
                    />
                  </div>

                  <div className="px-6 py-5 sm:px-7">
                    <Input
                        label="Email address"
                        type="email"
                        value={profileValues.email}
                        onChange={(event) =>
                            setProfileValues((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                        }
                        placeholder="name@example.com"
                        required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={isSaving}
                  >
                    Cancel
                  </Button>

                  <Button
                      type="submit"
                      loading={isSaving}
                      icon={<Icon name="check" size={16} />}
                  >
                    Save changes
                  </Button>
                </div>
              </form>
          ) : (
              <dl className="divide-y divide-line">
                <div className="px-6 py-5 sm:px-7">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Full name
                  </dt>

                  <dd className="mt-1.5 text-sm font-semibold text-secondary">
                    {user?.name || 'Not set'}
                  </dd>
                </div>

                <div className="px-6 py-5 sm:px-7">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Email address
                  </dt>

                  <dd className="mt-1.5 text-sm font-semibold text-secondary">
                    {user?.email || 'Not set'}
                  </dd>
                </div>

                {user?.phone && (
                    <div className="px-6 py-5 sm:px-7">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                        Mobile number
                      </dt>

                      <dd className="mt-1.5 text-sm font-semibold text-secondary">
                        {user.phone}
                      </dd>
                    </div>
                )}

                <div className="px-6 py-5 sm:px-7">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Account status
                  </dt>

                  <dd
                      className={`mt-1.5 flex items-center gap-2 text-sm font-semibold ${
                          user?.isActive === false
                              ? 'text-danger'
                              : 'text-success'
                      }`}
                  >
              <span
                  className={`h-2 w-2 rounded-full ${
                      user?.isActive === false
                          ? 'bg-danger'
                          : 'bg-success'
                  }`}
              />

                    {user?.isActive === false ? 'Inactive' : 'Active'}
                  </dd>
                </div>
              </dl>
          )}
        </Card>
      </div>
  );
};

export default UserProfile;