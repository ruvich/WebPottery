import { render, screen, fireEvent } from "@testing-library/react";
import { CreatePostPage } from "./CreatePostPage";

const mockNavigate = jest.fn();
const mockCreatePost = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../shared/lib/api/createPost", () => ({
  createPost: (...args: any[]) => mockCreatePost(...args),
}));

describe("CreatePostPage - simple tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("рендерится страница", () => {
    render(<CreatePostPage />);
    expect(screen.getByText("Создание поста")).toBeInTheDocument();
  });

  test("есть основные поля", () => {
    render(<CreatePostPage />);

    expect(screen.getByLabelText("Название")).toBeInTheDocument();
    expect(screen.getByLabelText("Описание")).toBeInTheDocument();
  });

  test("есть кнопки", () => {
    render(<CreatePostPage />);

    expect(screen.getByText("Создать")).toBeInTheDocument();
    expect(screen.getByText("Отмена")).toBeInTheDocument();
  });

  test("ввод в поле Название работает", () => {
    render(<CreatePostPage />);

    const input = screen.getByLabelText("Название");
    fireEvent.change(input, { target: { value: "Тест" } });

    expect(input).toHaveValue("Тест");
  });

  test("ошибка при пустом submit", () => {
    render(<CreatePostPage />);

    fireEvent.click(screen.getByText("Создать"));

    expect(
      screen.getByText("Название поста обязательно")
    ).toBeInTheDocument();
  });
});