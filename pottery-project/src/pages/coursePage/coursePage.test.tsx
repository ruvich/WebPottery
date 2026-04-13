import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostsPage } from "./coursePage";
import * as api from "../../shared/lib/api/posts";
import type { PostType } from "../../shared/lib/api/posts";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../shared/lib/api/posts", () => ({
  fetchPosts: jest.fn(),
  deletePost: jest.fn(),
}));

const mockPosts = Array.from({ length: 9 }, (_, i) => ({
  id: `post-${i}`,
  type: (i % 2 === 0 ? "MATERIAL" : "TASK") as PostType,
  title: `Пост ${i + 1}`,
  description: `Описание поста ${i + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

beforeEach(() => {
  (api.fetchPosts as jest.Mock).mockImplementation(async (page, size, type) => {
    const filtered = type ? mockPosts.filter(p => p.type === type) : mockPosts;
    const start = (page - 1) * size;
    const end = start + size;

    return {
      items: filtered.slice(start, end),
      page,
      size,
      total: filtered.length,
    };
  });

  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("PostsPage", () => {
  test("отображает фильтр и опции", async () => {
    render(<PostsPage />);

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    expect(await screen.findByRole("option", { name: "Все" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Материалы" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Задания" })).toBeInTheDocument();
  });

  test("показывает посты после загрузки", async () => {
    render(<PostsPage />);
    const posts = await screen.findAllByText(/Пост/i);
    expect(posts.length).toBeGreaterThan(0);
  });

  test("фильтрует посты по типу", async () => {
    render(<PostsPage />);

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    const materialOption = await screen.findByText("Материалы");
    userEvent.click(materialOption);

    const posts = await screen.findAllByText(/Пост/i);
    expect(posts.length).toBeGreaterThan(0);
  });

  test("смена страницы обновляет карточки", async () => {
    render(<PostsPage />);

    await waitFor(() => screen.getAllByText(/Пост/i));

    const nextPage = screen.getByRole("button", { name: /2/i });
    fireEvent.click(nextPage);

    const posts = await screen.findAllByText(/Пост/i);
    expect(posts.length).toBeGreaterThan(0);
  });

  test("редиректит на логин при 401", async () => {
    (api.fetchPosts as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(<PostsPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("редиректит на 500 страницу", async () => {
    (api.fetchPosts as jest.Mock).mockRejectedValueOnce({
      response: { status: 500 },
    });

    render(<PostsPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/error-500");
    });
  });
});

describe("PostsPage - роли и действия", () => {
  const originalRole = localStorage.getItem("userRole");

  afterAll(() => {
    if (originalRole) localStorage.setItem("userRole", originalRole);
    else localStorage.removeItem("userRole");
  });

  test("кнопка создания видна для TEACHER", () => {
    localStorage.setItem("userRole", "TEACHER");

    render(<PostsPage />);

    expect(
      screen.getByRole("button", { name: /создать пост/i })
    ).toBeInTheDocument();
  });

  test("кнопка создания скрыта для STUDENT", () => {
    localStorage.setItem("userRole", "STUDENT");

    render(<PostsPage />);

    expect(
      screen.queryByRole("button", { name: /создать пост/i })
    ).not.toBeInTheDocument();
  });

  test("кнопка удаления НЕ видна для STUDENT", async () => {
    localStorage.setItem("userRole", "STUDENT");

    render(<PostsPage />);

    await screen.findAllByText(/Пост/i);

    const deleteButtons = screen.queryAllByRole("button", {
      name: /delete/i,
    });

    expect(deleteButtons.length).toBe(0);
  });
});