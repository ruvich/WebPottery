import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditPostPage } from "./EditPostPage";

const mockNavigate = jest.fn();
const mockFetchPost = jest.fn();
const mockUpdatePost = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockNavigate,
  useParams: () => ({ postId: "123" }),
}));

jest.mock("../../shared/lib/api/createPost", () => ({
  fetchPostById: (...args: any[]) => mockFetchPost(...args),
  updatePost: (...args: any[]) => mockUpdatePost(...args),
}));

describe("EditPostPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("показывает loading", () => {
    mockFetchPost.mockReturnValue(new Promise(() => {}));

    render(<EditPostPage />);
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  test("рендерит данные поста MATERIAL", async () => {
    mockFetchPost.mockResolvedValue({
      type: "MATERIAL",
      title: "Материал",
      description: "Описание",
      material: {
        type: "LINK",
        title: "Док",
        url: "http://test",
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Материал")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Описание")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Док")).toBeInTheDocument();
    });
  });

  test("рендерит TASK + TEAM поля", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        description: "desc",
        mode: "TEAM",
        teamRules: {
          minTeamsCount: 1,
          maxTeamsCount: 3,
          minMembersPerTeam: 2,
          maxMembersPerTeam: 5,
        },
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Мин. команд")).toBeInTheDocument();
      expect(screen.getByLabelText("Макс. команд")).toBeInTheDocument();
    });
  });

  test("SOLO режим НЕ показывает team поля", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        description: "desc",
        mode: "SOLO",
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(screen.queryByLabelText("Мин. команд")).not.toBeInTheDocument();
    });
  });

  test("нельзя изменить тип и режим", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        mode: "TEAM",
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");

      expect(selects[0]).toHaveAttribute("aria-disabled", "true");
      expect(selects[1]).toHaveAttribute("aria-disabled", "true");
    });
  });

  test("изменение title работает", async () => {
    mockFetchPost.mockResolvedValue({
      type: "MATERIAL",
      title: "old",
    });

    render(<EditPostPage />);

    const input = await screen.findByLabelText("Название");

    fireEvent.change(input, { target: { value: "new" } });

    expect(input).toHaveValue("new");
  });

  test("submit вызывает updatePost", async () => {
    mockFetchPost.mockResolvedValue({
      type: "MATERIAL",
      title: "old",
    });

    render(<EditPostPage />);

    const input = await screen.findByLabelText("Название");
    fireEvent.change(input, { target: { value: "new" } });

    fireEvent.click(screen.getByText("Сохранить"));

    await waitFor(() => {
      expect(mockUpdatePost).toHaveBeenCalled();
    });
  });

  test("ошибка при submit отображается", async () => {
    mockFetchPost.mockResolvedValue({
      type: "MATERIAL",
      title: "old",
    });

    mockUpdatePost.mockRejectedValue(new Error("fail"));

    render(<EditPostPage />);

    fireEvent.click(await screen.findByText("Сохранить"));

    await waitFor(() => {
      expect(screen.getByText("Ошибка при сохранении")).toBeInTheDocument();
    });
  });

  test("редирект при ошибке загрузки", async () => {
    mockFetchPost.mockRejectedValue(new Error());

    render(<EditPostPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/error-500");
    });
  });

  test("валидатор блокирует кнопку", async () => {
    mockFetchPost.mockResolvedValue({
      type: "MATERIAL",
      title: "",
    });

    render(<EditPostPage />);

    const btn = await screen.findByText("Сохранить");
    expect(btn).toBeDisabled();
  });
});