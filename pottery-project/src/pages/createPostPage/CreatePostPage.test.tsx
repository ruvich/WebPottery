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

describe("CreatePostPage - extended tests", () => {
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
    expect(screen.getByLabelText("Подзаголовок")).toBeInTheDocument();
  });

  test("ввод названия работает", () => {
    render(<CreatePostPage />);

    const input = screen.getByLabelText("Название");
    fireEvent.change(input, { target: { value: "Тест" } });

    expect(input).toHaveValue("Тест");
  });

  test("ввод работает", () => {
    render(<CreatePostPage />);

    const input = screen.getByLabelText("Название");
    fireEvent.change(input, { target: { value: "Тест" } });

    expect(input).toHaveValue("Тест");
  });

  test("не показывает ошибку до нажатия создать", () => {
    render(<CreatePostPage />);

    expect(screen.queryByText("Название обязательно")).not.toBeInTheDocument();
  });

  test("submit проходит при заполненном названии", () => {
    render(<CreatePostPage />);
    const input = screen.getByLabelText("Название");
    fireEvent.change(input, { target: { value: "Новый пост" } });
    fireEvent.click(screen.getByText("Создать"));
    expect(screen.queryByText("Название обязательно")).not.toBeInTheDocument();
  });

  test("форма инициализируется пустой", () => {
    render(<CreatePostPage />);

    expect(screen.getByLabelText("Название")).toHaveValue("");
    expect(screen.getByLabelText("Подзаголовок")).toHaveValue("");
  });

  test("TEAM режим отображает настройки команд", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByText("Задание"));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByText("Командное"));

    expect(screen.getByLabelText("Мин. команд")).toBeInTheDocument();
    expect(screen.getByLabelText("Макс. команд")).toBeInTheDocument();
  });

  test("MATERIAL режим показывает поля материала", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Материал" }));

    expect(screen.getByLabelText("Название материала")).toBeInTheDocument();
  });

  test("SOLO режим не показывает настройки команд", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    expect(screen.queryByLabelText("Мин. команд")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Макс. команд")).not.toBeInTheDocument();
  });

  test("MATERIAL TEXT режим показывает поле текста", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Материал" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Текст" }));

    expect(screen.getByLabelText("Текст материала")).toBeInTheDocument();
  });
});