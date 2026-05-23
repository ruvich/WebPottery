import React, { useState } from 'react';
import type { UserProfile } from '../../shared/api/types/UserProfile';
import './EditProfile.css';

interface EditProfileProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>; 
}

export const EditProfile: React.FC<EditProfileProps> = ({ 
  profile, 
  onClose, 
  onSave 
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [about, setAbout] = useState(profile.about);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('Имя и фамилия не могут быть пустыми');
      return false;
    }
    if (fullName.length < 2) {
      setError('Имя должно содержать минимум 2 символа');
      return false;
    }
    if (about.length > 500) {
      setError('Описание не может быть длиннее 500 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave({ fullName, about });
      onClose(); 
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <div className="edit-profile-modal" onClick={handleClose}>
      <div className="edit-profile-content" onClick={e => e.stopPropagation()}>
        <div className="edit-profile-header">
          <h3>Редактировать профиль</h3>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="fullName">
              Имя и фамилия <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Введите ваше имя"
              disabled={isSaving}
              className={error?.includes('Имя') ? 'error' : ''}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="about">
              О себе <span className="optional">(необязательно)</span>
            </label>
            <textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Расскажите о себе, ваших интересах и навыках"
              rows={4}
              disabled={isSaving}
              className={error?.includes('Описание') ? 'error' : ''}
              maxLength={500}
            />
            <div className="textarea-counter">
              {about.length}/500 символов
            </div>
          </div>

          {error && (
            <div className="form-error">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleClose}
              disabled={isSaving}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </form>
        
        {isSaving && (
          <div className="saving-overlay">
            <div className="saving-indicator">
              <div className="spinner-large"></div>
              <p>Сохранение изменений...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};