import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../testUtils';
import { ProfilePage } from './ProfilePage'; 

import { profileApi } from '../../shared/api/api';
import type { ApiResponse, UserProfile } from '../../shared/api/types/UserProfile';

jest.mock('../../shared/api/api');

const mockProfileData: UserProfile = {
  userId: "test-123",
  fullName: "Тест Тестов",
  about: "Тестовое описание"
};

const mockProfileResponse: ApiResponse<UserProfile> = {
  data: mockProfileData,
  status: 200,
  message: "OK"
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (profileApi.getProfile as jest.Mock).mockResolvedValue(mockProfileResponse);
  });

  test('отображает загрузку при монтировании', () => {
    (profileApi.getProfile as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<ProfilePage />);
    
    expect(screen.getByText(/загрузка профиля/i)).toBeInTheDocument();
  });

  test('отображает профиль после успешной загрузки', async () => {
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    });
    
    expect(screen.getByText('test-123')).toBeInTheDocument();
    expect(screen.getByText('Тестовое описание')).toBeInTheDocument();
  });

  test('отображает ошибку при неудачной загрузке', async () => {
    const errorMessage = 'Ошибка загрузки';
    (profileApi.getProfile as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка загрузки профиля/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('кнопка "Попробовать снова" перезагружает профиль', async () => {
    (profileApi.getProfile as jest.Mock)
      .mockRejectedValueOnce(new Error('Ошибка'))
      .mockResolvedValueOnce(mockProfileResponse);
    
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка загрузки профиля/i)).toBeInTheDocument();
    });
    
    const retryButton = screen.getByText(/попробовать снова/i);
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    });
  });

  test('открывает модалку редактирования при клике на кнопку', async () => {
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    });
    
    // Находим кнопку редактирования
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    // Ищем заголовок модалки (H3), а не просто текст
    const modalTitle = await screen.findByRole('heading', { 
      name: /редактировать профиль/i,
      level: 3 // Указываем, что ищем заголовок 3-го уровня
    });
    expect(modalTitle).toBeInTheDocument();
    
  });

  test('сохраняет изменения профиля', async () => {
    const updatedProfileData: UserProfile = {
      ...mockProfileData,
      fullName: 'Обновленное Имя'
    };
    
    const updatedProfileResponse: ApiResponse<UserProfile> = {
      data: updatedProfileData,
      status: 200,
      message: "OK"
    };
    
    (profileApi.updateProfile as jest.Mock).mockResolvedValue(updatedProfileResponse);
    
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    });
    
    // Открываем модалку
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    // Ждем появления модалки
    await screen.findByRole('heading', { name: /редактировать профиль/i, level: 3 });
    
    // Находим инпут по лейблу
    const nameInput = screen.getByLabelText(/имя и фамилия/i);
    fireEvent.change(nameInput, { target: { value: 'Обновленное Имя' } });
    
    // Находим кнопку сохранения
    const saveButton = screen.getByRole('button', { name: /сохранить изменения/i });
    fireEvent.click(saveButton);
    
    // Проверяем, что имя обновилось
    await waitFor(() => {
      expect(screen.getByText('Обновленное Имя')).toBeInTheDocument();
    });
    
    // Проверяем, что модалка закрылась
    expect(screen.queryByRole('heading', { name: /редактировать профиль/i, level: 3 })).not.toBeInTheDocument();
  });

  // Дополнительный тест для проверки закрытия модалки
  test('закрывает модалку при клике на кнопку отмены', async () => {
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    });
    
    // Открываем модалку
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    // Проверяем, что модалка открылась
    const modalTitle = await screen.findByRole('heading', { 
      name: /редактировать профиль/i, 
      level: 3 
    });
    expect(modalTitle).toBeInTheDocument();
    
    // Находим и кликаем кнопку отмены
    const cancelButton = screen.getByRole('button', { name: /отмена/i });
    fireEvent.click(cancelButton);
    
    // Проверяем, что модалка закрылась
    await waitFor(() => {
      expect(screen.queryByRole('heading', { 
        name: /редактировать профиль/i, 
        level: 3 
      })).not.toBeInTheDocument();
    });
  });
});