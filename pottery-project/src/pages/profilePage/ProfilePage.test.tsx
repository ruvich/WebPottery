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
    
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    const modalTitle = await screen.findByRole('heading', { 
      name: /редактировать профиль/i,
      level: 3 
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
    
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    await screen.findByRole('heading', { name: /редактировать профиль/i, level: 3 });
    
    const nameInput = screen.getByLabelText(/имя и фамилия/i);
    fireEvent.change(nameInput, { target: { value: 'Обновленное Имя' } });
    
    const saveButton = screen.getByRole('button', { name: /сохранить изменения/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Обновленное Имя')).toBeInTheDocument();
    });
    
    expect(screen.queryByRole('heading', { name: /редактировать профиль/i, level: 3 })).not.toBeInTheDocument();
  });

  test('закрывает модалку при клике на кнопку отмены', async () => {
    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Тест Тестов')).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: /редактировать профиль/i });
    fireEvent.click(editButton);
    
    const modalTitle = await screen.findByRole('heading', { 
      name: /редактировать профиль/i, 
      level: 3 
    });
    expect(modalTitle).toBeInTheDocument();
    
    const cancelButton = screen.getByRole('button', { name: /отмена/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('heading', { 
        name: /редактировать профиль/i, 
        level: 3 
      })).not.toBeInTheDocument();
    });
  });
});