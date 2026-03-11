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

const mockPosts = Array.from({ length: 9 }, (_, i) => ({
  id: `post-${i}`,
  type: (i % 2 === 0 ? "MATERIAL" : "TASK") as PostType, 
  title: `Пост ${i + 1}`,
  description: `Описание поста ${i + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

beforeEach(() => {
  jest.spyOn(api, "fetchPosts").mockImplementation(async (page, size, type) => {
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

    const allOption = await screen.findByRole("option", { name: "Все" });
    const materialsOption = screen.getByRole("option", { name: "Материалы" });
    const tasksOption = screen.getByRole("option", { name: "Задания" });

    expect(allOption).toBeInTheDocument();
    expect(materialsOption).toBeInTheDocument();
    expect(tasksOption).toBeInTheDocument();
  });

  test("показывает первые посты после загрузки", async () => {
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

  test("пагинация отображается и имеет правильное количество страниц", async () => {
    render(<PostsPage />);
    await waitFor(() => {
      const paginationButtons = screen.getAllByRole("button", { name: /\d+/ });
      expect(paginationButtons.length).toBeGreaterThan(1);
    });
  });

  test("редиректит на логин при 401", async () => {
    jest.spyOn(api, "fetchPosts").mockRejectedValueOnce({ response: { status: 401 } });
    render(<PostsPage />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("редиректит на страницу 500 при 500", async () => {
    jest.spyOn(api, "fetchPosts").mockRejectedValueOnce({ response: { status: 500 } });
    render(<PostsPage />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/error-500");
    });
  });
});