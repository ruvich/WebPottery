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

  test("SOLO + P2P показывает дополнительные поля", async () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Peer-to-peer" }));

    expect(screen.getByLabelText("Количество проверок")).toBeInTheDocument();
    expect(screen.getByLabelText("Дедлайн проверки")).toBeInTheDocument();
  });

  test("P2P поля появляются только при выборе Peer-to-peer", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    expect(
      screen.queryByLabelText("Количество проверок")
    ).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Peer-to-peer" }));

    expect(screen.getByLabelText("Количество проверок")).toBeInTheDocument();
    expect(screen.getByLabelText("Дедлайн проверки")).toBeInTheDocument();
  });

  test("NORMAL режим скрывает P2P поля", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Обычная проверка" }));

    expect(
      screen.queryByLabelText("Количество проверок")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText("Дедлайн проверки")
    ).not.toBeInTheDocument();
  });

  test("P2P требует дедлайн", () => {
    render(<CreatePostPage />);

    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Test" },
    });

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Peer-to-peer" }));

    fireEvent.change(screen.getByLabelText("Количество проверок"), {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByText("Создать"));

    expect(screen.getByText(/обязателен/i)).toBeInTheDocument();
  });

  test("P2P не принимает 0 или отрицательные проверки", () => {
    render(<CreatePostPage />);

    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Test" },
    });

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Peer-to-peer" }));

    fireEvent.change(screen.getByLabelText("Количество проверок"), {
      target: { value: "0" },
    });

    expect(screen.getByLabelText("Количество проверок")).toHaveValue(0);

    fireEvent.click(screen.getByText("Создать"));

    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  test("смена P2P -> NORMAL сбрасывает зависимости UI", () => {
    render(<CreatePostPage />);

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Peer-to-peer" }));

    expect(screen.getByLabelText("Количество проверок")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Обычная проверка" }));

    expect(
      screen.queryByLabelText("Количество проверок")
    ).not.toBeInTheDocument();
  });
  
  test("P2P с 0 проверок не проходит валидацию", async () => {
    render(<CreatePostPage />);

    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Test" },
    });

    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Задание" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByRole("option", { name: "Индивидуальное" }));

    fireEvent.mouseDown(screen.getAllByRole("combobox")[2]);
    fireEvent.click(screen.getByRole("option", { name: "Peer-to-peer" }));

    fireEvent.change(screen.getByLabelText("Количество проверок"), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByText("Создать"));

    expect(mockCreatePost).not.toHaveBeenCalled();
  });
});