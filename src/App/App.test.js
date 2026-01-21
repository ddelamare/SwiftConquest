import { render } from '@testing-library/react';
import App from './App';

test('renders game board', () => {
  const { container } = render(<App />);
  const boardElement = container.querySelector('.board');
  expect(boardElement).toBeInTheDocument();
});
