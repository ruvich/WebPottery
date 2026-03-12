import { profileApi,  } from '../api';
import type { UserProfile,  } from '../types/UserProfile';

const mockProfile: UserProfile = {
  userId: "3fa85f64-5717-4562-b3fc-2c963f66af6e",
  fullName: "Иван Иванов",
  about: "Студент 3 курса"
};



describe('API Profile Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getProfile должен возвращать данные профиля', async () => {
    const response = await profileApi.getProfile();
    
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('status', 200);
    expect(response.data).toHaveProperty('userId');
    expect(response.data).toHaveProperty('fullName');
    expect(response.data).toHaveProperty('about');
  });

  test('getProfile должен возвращать правильную структуру данных', async () => {
    const response = await profileApi.getProfile();
    
    expect(response.data.userId).toBeDefined();
    expect(typeof response.data.userId).toBe('string');
    expect(typeof response.data.fullName).toBe('string');
    expect(typeof response.data.about).toBe('string');
  });

  test('updateProfile должен обновлять данные профиля', async () => {
    const updatedData = {
      fullName: 'Петр Петров',
      about: 'Новое описание'
    };
    
    const response = await profileApi.updateProfile(updatedData);
    
    expect(response.data.fullName).toBe(updatedData.fullName);
    expect(response.data.about).toBe(updatedData.about);
    expect(response.status).toBe(200);
  });

  test('updateProfile должен сохранять неизмененные поля', async () => {
    const originalProfile = await profileApi.getProfile();
    const updatedData = { fullName: 'Новое Имя' };
    
    const response = await profileApi.updateProfile(updatedData);
    
    expect(response.data.fullName).toBe(updatedData.fullName);
    expect(response.data.about).toBe(originalProfile.data.about);
  });
});
