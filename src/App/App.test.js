import { render } from '@testing-library/react';
import App from './App';

test('renders game board', () => {
  const { container } = render(<App />);
  expect(container.querySelector('.board')).toBeInTheDocument();
});
