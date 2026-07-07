import {useCallback, useEffect, useMemo, useState} from 'react';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import Alert from '../UI/Alert';
import Avatar from '../UI/Avatar';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import Card from '../UI/Card';
import EmptyState from '../UI/EmptyState';
import Icon from '../UI/Icon';
import Input from '../UI/Input';
import {CardSkeleton} from '../UI/Loading';
import Modal from '../UI/Modal';
import Select from '../UI/Select';
import StatCard from '../UI/StatCard';
import {updateRole} from "../../services/auth.service.js";

const roleVariants = {
    admin: 'danger',
    lead: 'warning',
    member: 'primary',
};

const roleOptions = [
    {value: 'member', label: 'Member'},
    {value: 'lead', label: 'Lead'},
    {value: 'admin', label: 'Admin'},
];

const roleFilterOptions = [
    {value: 'all', label: 'All roles'},
    ...roleOptions,
];

const getUpdatedUser = (data) => {
    return data?.user || data?.data?.user || data?.data || null;
};

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [feedback, setFeedback] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    const {
        allUsers: users,
        user: currentUser,
        getAllUsers,
        deleteUser,
        updateRole,
        loading: isLoading,
    } = useAuth();

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);


    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return users.filter((candidate) => {
            const matchesRole =
                roleFilter === 'all' || candidate.role === roleFilter;

            const matchesSearch =
                !normalizedSearch ||
                candidate.name?.toLowerCase().includes(normalizedSearch) ||
                candidate.email?.toLowerCase().includes(normalizedSearch);

            return matchesRole && matchesSearch;
        });
    }, [roleFilter, searchTerm, users]);

    const roleCounts = useMemo(() => {
        return {
            total: users.length,
            admin: users.filter((candidate) => candidate.role === 'admin')
                .length,
            lead: users.filter((candidate) => candidate.role === 'lead')
                .length,
            member: users.filter((candidate) => candidate.role === 'member')
                .length,
        };
    }, [users]);

    const openUserModal = (candidate) => {
        setSelectedUser(candidate);
        setSelectedRole(candidate.role);
        setModalError('');
        setIsModalOpen(true);
    };

    const closeUserModal = () => {
        if (isSaving) {
            return;
        }

        setSelectedUser(null);
        setSelectedRole('');
        setModalError('');
        setIsModalOpen(false);
    };

    const saveRole = async () => {
        if (!selectedUser || selectedRole === selectedUser.role) {
            closeUserModal();
            return;
        }

        setIsSaving(true);
        setModalError('');

        try {
            const response = await updateRole(
                selectedUser._id,
                selectedRole
            );

            if (!response?.success) {
                throw new Error(
                    response?.message || 'Unable to update user role.'
                );
            }

            setFeedback({
                type: 'success',
                message: `${selectedUser.name}'s role was updated as ${selectedRole}.`,
            });
            getAllUsers();
            closeUserModal();
        } catch (error) {
            setModalError(
                error?.response?.data?.message ||
                error?.message ||
                'Unable to update user role.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const removeUser = async () => {
        if (!selectedUser) {
            return;
        }

        const shouldRemove = window.confirm(
            `Remove ${selectedUser.name} from the workspace? This action cannot be undone.`
        );

        if (!shouldRemove) {
            return;
        }

        setIsSaving(true);
        setModalError('');

        try {
            await deleteUser(selectedUser._id);

            setFeedback({
                type: 'success',
                message: `${selectedUser.name} was removed from the workspace.`,
            });

            closeUserModal();
        } catch (error) {
            setModalError(
                error.response?.data?.message ||
                'Unable to remove this user from the workspace.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="page-container space-y-6">
            <header
                className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="section-label">Administration</p>

                    <div className="mt-1 flex items-start gap-3">
            <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <Icon name="users" size={21}/>
            </span>

                        <div>
                            <h1 className="page-title">User management</h1>

                            <p className="page-subtitle">
                                Manage workspace members and access permissions.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-muted shadow-card">
                    <span className="h-2 w-2 rounded-full bg-success"/>
                    Workspace directory
                </div>
            </header>

            {feedback && (
                <Alert
                    type={feedback.type}
                    message={feedback.message}
                    onClose={() => setFeedback(null)}
                    autoClose={4000}
                />
            )}

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({length: 4}, (_, index) => (
                        <CardSkeleton key={index}/>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total users"
                        value={roleCounts.total}
                        icon="users"
                        tone="primary"
                    />

                    <StatCard
                        label="Administrators"
                        value={roleCounts.admin}
                        icon="settings"
                        tone="danger"
                    />

                    <StatCard
                        label="Team leads"
                        value={roleCounts.lead}
                        icon="target"
                        tone="warning"
                    />

                    <StatCard
                        label="Members"
                        value={roleCounts.member}
                        icon="user"
                        tone="success"
                    />
                </div>
            )}

            <section className="rounded-2xl border border-line bg-surface p-3 shadow-card sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by name or email"
                        icon="search"
                        className="flex-1"
                    />

                    <div className="flex items-center gap-3">
                        <div className="min-w-[150px]">
                            <Select
                                value={roleFilter}
                                onChange={(event) => setRoleFilter(event.target.value)}
                                options={roleFilterOptions}
                                selectClassName="h-10 text-sm"
                            />
                        </div>

                        <span className="hidden whitespace-nowrap text-xs font-medium text-muted sm:block">
              {filteredUsers.length}{' '}
                            {filteredUsers.length === 1 ? 'user' : 'users'}
            </span>
                    </div>
                </div>
            </section>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({length: 5}, (_, index) => (
                        <CardSkeleton key={index}/>
                    ))}
                </div>
            ) : filteredUsers.length > 0 ? (
                <Card className="overflow-hidden border border-line p-0">
                    <div
                        className="hidden grid-cols-[minmax(0,1fr)_130px_130px_48px] gap-5 border-b border-line bg-surfaceSubtle px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted lg:grid">
                        <span>User</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span/>
                    </div>

                    <div className="divide-y divide-line">
                        {filteredUsers.map((candidate) => {
                            const isCurrentUser =
                                candidate._id === currentUser?._id;

                            const isActive = candidate.isActive !== false;

                            return (
                                <article
                                    key={candidate._id}
                                    className="grid gap-4 px-4 py-4 transition-colors hover:bg-surfaceSubtle sm:px-5 lg:grid-cols-[minmax(0,1fr)_130px_130px_48px] lg:items-center lg:gap-5"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar
                                            user={candidate}
                                            size="sm"
                                            showStatus={isActive}
                                        />

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-secondary">
                                                    {candidate.name}
                                                </p>

                                                {isCurrentUser && (
                                                    <span
                                                        className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            YOU
                          </span>
                                                )}
                                            </div>

                                            <p className="mt-0.5 truncate text-xs text-muted">
                                                {candidate.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center lg:block">
                    <span className="mr-2 text-xs text-muted lg:hidden">
                      Role:
                    </span>

                                        <Badge
                                            variant={
                                                roleVariants[candidate.role] || 'secondary'
                                            }
                                            size="sm"
                                        >
                                            {candidate.role}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isActive ? 'bg-success' : 'bg-slate-300'
                        }`}
                    />

                                        <span className="text-xs font-medium text-muted">
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                                    </div>

                                    <div className="flex justify-end">
                                        {isCurrentUser ? (
                                            <span className="px-2 text-xs font-medium text-muted">
                        Current user
                      </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openUserModal(candidate)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary-50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                                aria-label={`Manage ${candidate.name}`}
                                                title={`Manage ${candidate.name}`}
                                            >
                        <span className="pb-1 text-sm leading-none">
                          •••
                        </span>
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </Card>
            ) : (
                <div className="panel">
                    <EmptyState
                        title="No users found"
                        description="Try a different name, email address, or role filter."
                        icon="users"
                    />
                </div>
            )}

            {isModalOpen && selectedUser && (
                <Modal
                    isOpen
                    onClose={closeUserModal}
                    title="Manage user"
                    subtitle="Review account details and update workspace access."
                    size="md"
                >
                    <div className="space-y-5 p-5 sm:p-6">
                        {modalError && (
                            <Alert
                                type="error"
                                message={modalError}
                                onClose={() => setModalError('')}
                            />
                        )}

                        <div className="flex items-center gap-3 rounded-xl border border-line bg-surfaceSubtle p-4">
                            <Avatar user={selectedUser} size="lg"/>

                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-secondary">
                                    {selectedUser.name}
                                </p>

                                <p className="mt-0.5 truncate text-sm text-muted">
                                    {selectedUser.email}
                                </p>

                                <div className="mt-2">
                                    <Badge
                                        variant={
                                            roleVariants[selectedUser.role] || 'secondary'
                                        }
                                        size="sm"
                                    >
                                        {selectedUser.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Select
                            label="Change role"
                            value={selectedRole}
                            onChange={(event) => setSelectedRole(event.target.value)}
                            options={roleOptions}
                        />

                        <div
                            className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={removeUser}
                                disabled={isSaving}
                                className="text-danger hover:bg-danger-soft hover:text-danger"
                                icon={<Icon name="trash" size={16}/>}
                            >
                                Remove user
                            </Button>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeUserModal}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    loading={isSaving}
                                    onClick={saveRole}
                                    disabled={selectedRole === selectedUser.role}
                                    icon={<Icon name="check" size={16}/>}
                                >
                                    Save changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default UserManagement;