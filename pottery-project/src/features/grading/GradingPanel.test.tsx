import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradingPanel } from './GradingPanel';

describe('GradingPanel', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерит слайдер с начальным значением 3', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('3');
    
    const scoreElement = screen.getByText('3', { selector: '.score' });
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveClass('score');
  });

  it('рендерит начальные значения, если они переданы', () => {
    render(
      <GradingPanel 
        onSubmit={mockOnSubmit} 
        initialScore={5}
        initialComment="Отличная работа"
      />
    );
    
    expect(screen.getByRole('slider')).toHaveValue('5');
    
    // Ищем цифру 5 в элементе с классом score
    const scoreElement = screen.getByText('5', { selector: '.score' });
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveClass('score');
    
    // Проверяем комментарий
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Отличная работа');
  });

  it('обновляет оценку при изменении слайдера', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '5' } });
    
    // После изменения слайдера цифра должна стать 5
    const scoreElement = screen.getByText('5', { selector: '.score' });
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveClass('score');
    
    // Проверяем, что цифра 3 больше не отображается как score
    const oldScore = screen.queryByText('3', { selector: '.score' });
    expect(oldScore).not.toBeInTheDocument();
  });

  it('отображает все метки оценок 1-5', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    
    // Проверяем, что все цифры есть в метках под слайдером
    // Используем getAllByText и фильтруем по родительскому элементу
    const labels = screen.getAllByText(/[1-5]/).filter(
      element => element.closest('.scoreLabels')
    );
    
    expect(labels).toHaveLength(5);
    expect(labels[0]).toHaveTextContent('1');
    expect(labels[1]).toHaveTextContent('2');
    expect(labels[2]).toHaveTextContent('3');
    expect(labels[3]).toHaveTextContent('4');
    expect(labels[4]).toHaveTextContent('5');
  });

  it('вызывает onSubmit с правильными значениями', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    
    // Устанавливаем оценку 4
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } });
    
    // Добавляем комментарий
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Хорошая работа' } });
    
    // Отправляем форму
    fireEvent.click(screen.getByText('Оценить'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith(4, 'Хорошая работа');
  });

  it('отображает кнопку "Отмена" и вызывает onCancel при клике', () => {
    render(
      <GradingPanel 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Отмена');
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('не отображает кнопку "Отмена", если onCancel не передан', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    expect(screen.queryByText('Отмена')).not.toBeInTheDocument();
  });

  it('должен иметь поле для комментария с правильным placeholder', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Добавьте комментарий к оценке...');
  });

  it('обновляет комментарий при вводе текста', () => {
    render(<GradingPanel onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Новый комментарий' } });
    
    expect(textarea).toHaveValue('Новый комментарий');
  });
});