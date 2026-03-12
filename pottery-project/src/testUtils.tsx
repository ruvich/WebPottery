import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Определяем тип для пропсов провайдера
interface WrapperProps {
  children: React.ReactNode;
}

// Провайдер для тестов с роутингом
const AllTheProviders: React.FC<WrapperProps> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Кастомный render с провайдерами
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Переэкспорт всего из testing-library
export * from '@testing-library/react';
export { customRender as render };