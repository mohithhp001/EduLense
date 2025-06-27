import React from 'react';
import { render, screen } from '@testing-library/react';
import FileUpload from '../components/FileUpload';

describe('FileUpload', () => {
  it('renders upload prompt', () => {
    render(<FileUpload onFileUpload={() => {}} />);
    expect(screen.getByText(/upload your study material/i)).toBeInTheDocument();
  });
}); 