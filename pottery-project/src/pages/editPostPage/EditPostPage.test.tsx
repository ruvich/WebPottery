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

  test("P2P данные загружаются корректно", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        mode: "SOLO",
        reviewSettings: {
          reviewType: "PEER_TO_PEER",
          reviewsPerStudent: 3,
          reviewDeadline: "2026-12-01T10:00:00.000Z",
        },
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });
  });

  test("P2P режим показывает поля проверки", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        mode: "SOLO",
        reviewSettings: {
          reviewType: "PEER_TO_PEER",
          reviewsPerStudent: 2,
          reviewDeadline: "2026-12-01T10:00:00.000Z",
        },
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Количество проверок")
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText("Дедлайн проверки")
      ).toBeInTheDocument();
    });
  });

  test("изменение P2P настроек работает", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        mode: "SOLO",
        reviewSettings: {
          reviewType: "PEER_TO_PEER",
          reviewsPerStudent: 2,
          reviewDeadline: "2026-12-01T10:00:00.000Z",
        },
      },
    });

    render(<EditPostPage />);

    const input = await screen.findByLabelText("Количество проверок");

    fireEvent.change(input, { target: { value: "5" } });

    expect(input).toHaveValue(5);
  });

  test("P2P данные уходят в updatePost", async () => {
    mockFetchPost.mockResolvedValue({
      type: "TASK",
      title: "Задание",
      task: {
        mode: "SOLO",
        reviewSettings: {
          reviewType: "PEER_TO_PEER",
          reviewsPerStudent: 2,
          reviewDeadline: "2026-12-01T10:00:00.000Z",
        },
      },
    });

    render(<EditPostPage />);

    const btn = await screen.findByText("Сохранить");
    fireEvent.click(btn);

    await waitFor(() => {
      const payload = mockUpdatePost.mock.calls[0][1];

      expect(payload.task.reviewSettings).toEqual(
        expect.objectContaining({
          reviewType: "PEER_TO_PEER",
          reviewsPerStudent: 2,
        })
      );
    });
  });

});