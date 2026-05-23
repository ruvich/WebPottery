import React, { useEffect, useState } from 'react';
import  { ProfileCard } from '../../entities/profile/ProfileCard';
import { EditProfile } from '../../features/EditProfile/EditProfile';
import { profileApi } from '../../shared/api/profileApi';

import type { UserProfile } from '../../shared/api/types/UserProfile';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileApi.getProfile();
      setProfile(response.data);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить профиль');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      setSaveError(null);
      
      const response = await profileApi.updateProfile(updatedData);
      
      setProfile(response.data);
      
      showNotification('Профиль успешно обновлен!', 'success');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при сохранении профиля';
      setSaveError(errorMessage);
      
      showNotification(errorMessage, 'error');
      
      throw err;
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <h3>Ошибка загрузки профиля</h3>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={loadProfile}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="not-found-container">
          <h3>Профиль не найден</h3>
          <p>Возможно, пользователь был удален</p>
          <button className="retry-button" onClick={loadProfile}>
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileCard 
          profile={profile} 
          onEdit={handleEditClick}
        />
      </div>

      {isEditing && (
        <EditProfile
          profile={profile}
          onClose={handleCloseEdit}
          onSave={handleSaveProfile}
        />
      )}

      {saveError && (
        <div className="global-error">
          {saveError}
        </div>
      )}
    </div>
  );
};