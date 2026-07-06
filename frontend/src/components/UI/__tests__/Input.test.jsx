import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Input from '../Input';

describe('Input', () => {
  it('connects its label, value, error, and change callback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const ControlledInput = () => {
      const [value, setValue] = useState('');

      return (
        <Input
          label="Project name"
          name="name"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event);
          }}
          required
          error="Project name is required"
        />
      );
    };

    render(<ControlledInput />);

    const input = screen.getByRole('textbox', { name: /project name/i });
    await user.type(input, 'Roadmap');

    expect(input).toBeRequired();
    expect(screen.getByText('Project name is required')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('Roadmap');
  });

  it('renders a textarea when requested', () => {
    render(<Input label="Description" name="description" type="textarea" value="" onChange={() => {}} />);

    expect(screen.getByRole('textbox', { name: /description/i }).tagName).toBe('TEXTAREA');
  });
});
