import React from 'react';
import type { UserProfile } from '../../shared/api/types/UserProfile';
import './ProfileCard.css';

interface ProfileCardProps {
  profile: UserProfile;
  onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit }) => {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {/* Заглушка для аватара */}
          <span className="avatar-initials">
            {profile.fullName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <h2 className="profile-name">{profile.fullName}</h2>
      </div>
      
      <div className="profile-info">
        <div className="info-item">
          <span className="info-label">ID:</span>
          <span className="info-value">{profile.userId}</span>
        </div>
        
        <div className="info-item about-item">
          <span className="info-label">О себе:</span>
          <p className="about-text">{profile.about || "Пользователь пока ничего не рассказал о себе"}</p>
        </div>
      </div>

      {onEdit && (
        <button 
          className="edit-profile-button"
          onClick={onEdit}
          aria-label="Редактировать профиль"
        >
          <svg className="edit-icon" viewBox="0 0 24 24" width="18" height="18">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Редактировать профиль
        </button>
      )}
    </div>
  );
};