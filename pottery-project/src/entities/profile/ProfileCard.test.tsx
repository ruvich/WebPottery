// src/entities/ProfileCard/__tests__/ProfileCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '../../testUtils';
import { ProfileCard } from './ProfileCard';

const mockProfile = {
  userId: "test-123",
  fullName: "Тест Тестов",
  about: "Тестовое описание"
};

describe('ProfileCard Component', () => {
  test('отображает информацию профиля', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    // Проверяем отображение имени
    expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    
    // Проверяем отображение ID
    expect(screen.getByText('test-123')).toBeInTheDocument();
    
    // Проверяем отображение описания
    expect(screen.getByText('Тестовое описание')).toBeInTheDocument();
  });

  test('отображает инициалы в аватаре', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    const initials = screen.getByText('ТТ'); // Тест Тестов -> ТТ
    expect(initials).toBeInTheDocument();
  });

  test('отображает заглушку, если нет описания', () => {
    const profileWithoutAbout = {
      ...mockProfile,
      about: ''
    };
    
    render(<ProfileCard profile={profileWithoutAbout} />);
    
    expect(screen.getByText(/пользователь пока ничего не рассказал/i)).toBeInTheDocument();
  });

  test('вызывает onEdit при клике на кнопку редактирования', () => {
    const handleEdit = jest.fn();
    
    render(<ProfileCard profile={mockProfile} onEdit={handleEdit} />);
    
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  test('не отображает кнопку редактирования, если onEdit не передан', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    const editButton = screen.queryByRole('button', { name: /редактировать профиль/i });
    expect(editButton).not.toBeInTheDocument();
  });
});