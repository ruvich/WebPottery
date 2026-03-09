import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import * as auth from '../../shared/lib/api/auth';

describe('LoginForm', () => {

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('Рендер формы', () => {
    test('отображает поля email и пароль', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });
  });

  describe('Валидация формы', () => {
    test('показывает ошибку если поля пустые', async () => {
      render(<LoginForm />);
      const button = screen.getByRole('button', { name: /войти/i });
      await userEvent.click(button);

      const errors = screen.getAllByText(/обязательное поле/i);
      expect(errors.length).toBe(2);
    });

    test('показывает ошибку если email невалидный', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/пароль/i)
    const button = screen.getByRole('button', { name: /войти/i })

    await userEvent.type(emailInput, 'not-email')
    await userEvent.type(passwordInput, '123456')
    await userEvent.click(button)

    const errors = screen.getAllByText('Неверный email')
    expect(errors[0]).toBeInTheDocument()
    })
  });

  describe('Авторизация', () => {

    test('успешный логин', async () => {
      jest.spyOn(auth, 'login').mockResolvedValue({
        accessToken: 'token',
        user: { id: '1', email: 'user@example.com', role: 'STUDENT' },
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/пароль/i);
      const button = screen.getByRole('button', { name: /войти/i });

      await userEvent.type(emailInput, 'user@example.com');
      await userEvent.type(passwordInput, '123456');
      await userEvent.click(button);

      await waitFor(() => {
        expect(auth.login).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: '123456',
        });
      });

      expect(emailInput).toHaveValue('user@example.com');
      expect(passwordInput).toHaveValue('123456');
    });

    test('логин с неверными данными - 400', async () => {
      jest.spyOn(auth, 'login').mockRejectedValue({ response: { status: 400 } });

      render(<LoginForm />);

      await userEvent.type(screen.getByLabelText(/email/i), 'bad@example.com');
      await userEvent.type(screen.getByLabelText(/пароль/i), '123456');
      await userEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/неверный логин или пароль/i)).toBeInTheDocument();
      });
    });

    test('ошибка сервера - 500', async () => {
      jest.spyOn(auth, 'login').mockRejectedValue({ response: { status: 500 } });

      render(<LoginForm />);

      await userEvent.type(screen.getByLabelText(/email/i), 'any@example.com');
      await userEvent.type(screen.getByLabelText(/пароль/i), '123456');
      await userEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/сервер недоступен/i)).toBeInTheDocument();
      });
    });
  });
});