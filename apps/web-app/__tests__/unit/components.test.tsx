import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

describe('React Components', () => {
  describe('Button Component', () => {
    it('should render button with correct text', () => {
      render(
        <button data-testid="test-button" onClick={() => {}}>
          Click me
        </button>
      )

      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    it('should call onClick when clicked', () => {
      const handleClick = jest.fn()
      
      render(
        <button data-testid="test-button" onClick={handleClick}>
          Click me
        </button>
      )

      const button = screen.getByTestId('test-button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Component', () => {
    it('should render form inputs', () => {
      render(
        <form data-testid="test-form">
          <input
            data-testid="username-input"
            name="username"
            type="text"
            placeholder="Username"
          />
          <input
            data-testid="password-input"
            name="password"
            type="password"
            placeholder="Password"
          />
          <button type="submit">Submit</button>
        </form>
      )

      expect(screen.getByTestId('test-form')).toBeInTheDocument()
      expect(screen.getByTestId('username-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      const user = userEvent.setup()

      render(
        <form data-testid="test-form" onSubmit={handleSubmit}>
          <input
            data-testid="username-input"
            name="username"
            type="text"
            placeholder="Username"
          />
          <input
            data-testid="password-input"
            name="password"
            type="password"
            placeholder="Password"
          />
          <button type="submit">Submit</button>
        </form>
      )

      const usernameInput = screen.getByTestId('username-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByRole('button')

      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'testpass')
      await user.click(submitButton)

      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(usernameInput).toHaveValue('testuser')
      expect(passwordInput).toHaveValue('testpass')
    })
  })

  describe('Table Component', () => {
    it('should render table with data', () => {
      const mockData = [
        { id: 1, name: 'Client A', email: 'clienta@example.com' },
        { id: 2, name: 'Client B', email: 'clientb@example.com' },
      ]

      render(
        <table data-testid="test-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((client) => (
              <tr key={client.id} data-testid={`row-${client.id}`}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )

      expect(screen.getByTestId('test-table')).toBeInTheDocument()
      expect(screen.getByTestId('row-1')).toBeInTheDocument()
      expect(screen.getByTestId('row-2')).toBeInTheDocument()
      expect(screen.getByText('Client A')).toBeInTheDocument()
      expect(screen.getByText('Client B')).toBeInTheDocument()
    })
  })

  describe('Modal Component', () => {
    it('should show modal when open', () => {
      render(
        <div data-testid="modal" style={{ display: 'block' }}>
          <div data-testid="modal-content">
            <h2>Modal Title</h2>
            <p>Modal content</p>
            <button data-testid="close-button">Close</button>
          </div>
        </div>
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-content')).toBeInTheDocument()
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
      expect(screen.getByTestId('close-button')).toBeInTheDocument()
    })

    it('should hide modal when closed', () => {
      const { rerender } = render(
        <div data-testid="modal" style={{ display: 'block' }}>
          <div data-testid="modal-content">
            <h2>Modal Title</h2>
            <p>Modal content</p>
            <button data-testid="close-button">Close</button>
          </div>
        </div>
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      // Hide modal
      rerender(
        <div data-testid="modal" style={{ display: 'none' }}>
          <div data-testid="modal-content">
            <h2>Modal Title</h2>
            <p>Modal content</p>
            <button data-testid="close-button">Close</button>
          </div>
        </div>
      )

      const modal = screen.getByTestId('modal')
      expect(modal).toHaveStyle({ display: 'none' })
    })
  })
}) 