// src/features/EditProfile/__tests__/EditProfile.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../testUtils';
import { EditProfile } from './EditProfile';

const mockProfile = {
  userId: "test-123",
  fullName: "Тест Тестов",
  about: "Тестовое описание"
};

describe('EditProfile Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает форму с текущими данными', () => {
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/имя и фамилия/i) as HTMLInputElement;
    const aboutInput = screen.getByLabelText(/о себе/i) as HTMLTextAreaElement;
    
    expect(nameInput.value).toBe(mockProfile.fullName);
    expect(aboutInput.value).toBe(mockProfile.about);
  });

  test('позволяет изменять поля', () => {
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/имя и фамилия/i);
    const aboutInput = screen.getByLabelText(/о себе/i);
    
    fireEvent.change(nameInput, { target: { value: 'Новое Имя' } });
    fireEvent.change(aboutInput, { target: { value: 'Новое описание' } });
    
    expect(nameInput).toHaveValue('Новое Имя');
    expect(aboutInput).toHaveValue('Новое описание');
  });

  test('валидация: имя не может быть пустым', async () => {
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/имя и фамилия/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    const saveButton = screen.getByText('Сохранить изменения');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/имя и фамилия не могут быть пустыми/i)).toBeInTheDocument();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('валидация: имя минимум 2 символа', async () => {
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/имя и фамилия/i);
    fireEvent.change(nameInput, { target: { value: 'А' } });
    
    const saveButton = screen.getByText('Сохранить изменения');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/имя должно содержать минимум 2 символа/i)).toBeInTheDocument();
    });
  });

  test('валидация: описание не длиннее 500 символов', async () => {
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const aboutInput = screen.getByLabelText(/о себе/i);
    fireEvent.change(aboutInput, { target: { value: 'а'.repeat(501) } });
    
    const saveButton = screen.getByText('Сохранить изменения');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/описание не может быть длиннее 500 символов/i)).toBeInTheDocument();
    });
  });

  test('успешное сохранение вызывает onSave и закрывает модалку', async () => {
    mockOnSave.mockResolvedValueOnce(undefined);
    
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const saveButton = screen.getByText('Сохранить изменения');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        fullName: mockProfile.fullName,
        about: mockProfile.about
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('отображает счетчик символов', () => {
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const aboutInput = screen.getByLabelText(/о себе/i);
    expect(screen.getByText(`${mockProfile.about.length}/500 символов`)).toBeInTheDocument();
  });

  test('кнопки отключаются во время сохранения', async () => {
    mockOnSave.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <EditProfile 
        profile={mockProfile} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const saveButton = screen.getByText('Сохранить изменения');
    const cancelButton = screen.getByText('Отмена');
    
    fireEvent.click(saveButton);
    
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(screen.getByText('Сохранение...')).toBeInTheDocument();
  });
});