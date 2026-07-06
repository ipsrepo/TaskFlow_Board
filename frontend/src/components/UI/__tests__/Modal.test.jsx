import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from '../Modal';

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Edit project">Content</Modal>);

    expect(screen.queryByText('Edit project')).not.toBeInTheDocument();
  });

  it('closes from Escape and restores page scrolling', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Modal isOpen onClose={onClose} title="Edit project">Content</Modal>);

    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Modal isOpen onClose={onClose} title="Edit project">Content</Modal>);
    await user.click(screen.getAllByRole('button', { name: /close modal/i })[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
