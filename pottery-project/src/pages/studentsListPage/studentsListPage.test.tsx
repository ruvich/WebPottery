import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StudentsListPage } from "./studentsListPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../entities/students/StudentCard", () => ({
  StudentCard: ({ student }: { student: any }) => (
    <div data-testid="student-card" onClick={() => mockNavigate(`/profile/student/${student.id}`)}>
      {student.fullName}
    </div>
  ),
}));

const mockStudents = Array.from({ length: 23 }, (_, i) => ({
  id: `${i + 1}`,
  fullName: `Студент ${i + 1}`,
}));

jest.mock("../../shared/lib/api/studentsList", () => ({
  getStudents: jest.fn(async (page = 0, size = 10, q?: string) => {
    let filtered = mockStudents;
    if (q) filtered = filtered.filter((s) =>
      s.fullName.toLowerCase().includes(q.toLowerCase())
    );
    const start = page * size;
    const end = start + size;
    return { items: filtered.slice(start, end), page, size, total: filtered.length };
  }),
}));

describe("StudentsListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит первые 10 студентов и пагинацию", async () => {
    render(<StudentsListPage />);
    await waitFor(() => {
        expect(screen.getByText("Студент 1")).toBeInTheDocument();
        expect(screen.getByText("Студент 10")).toBeInTheDocument();
    });
    expect(screen.queryByText("Студент 11")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to page 2/i })).toBeInTheDocument();
  });

  test("смена страницы через пагинацию отображает следующие студенты", async () => {
    render(<StudentsListPage studentsFromProps={mockStudents} />);

    await waitFor(() => {
        expect(screen.getByText("Студент 1")).toBeInTheDocument();
        expect(screen.getByText("Студент 10")).toBeInTheDocument();
    });

    const page2Button = screen.getByRole("button", { name: /go to page 2/i });
    fireEvent.click(page2Button);

    await waitFor(() => {
        expect(screen.getByText("Студент 11")).toBeInTheDocument();
        expect(screen.getByText("Студент 20")).toBeInTheDocument();
        expect(screen.queryByText("Студент 1")).not.toBeInTheDocument();
    });
  });

  test("поиск студентов фильтрует список", async () => {
    render(<StudentsListPage />);
    const input = screen.getByLabelText("Поиск по имени");

    fireEvent.change(input, { target: { value: "3" } });

    await waitFor(() => {
      expect(screen.getByText("Студент 3")).toBeInTheDocument();
      expect(screen.getByText("Студент 13")).toBeInTheDocument();
      expect(screen.queryByText("Студент 1")).not.toBeInTheDocument();
    });
  });

  test("клик по студенту вызывает navigate с правильным id", async () => {
    render(<StudentsListPage />);
    const studentCard = await screen.findByText("Студент 1");
    fireEvent.click(studentCard);

    expect(mockNavigate).toHaveBeenCalledWith("/profile/student/1");
  });

  test("показывает сообщение 'Студенты не найдены', если список пустой", async () => {
    const { getStudents } = require("../../shared/lib/api/studentsList");
    getStudents.mockResolvedValueOnce({ items: [], page: 0, size: 10, total: 0 });

    render(<StudentsListPage />);
    await waitFor(() => {
      expect(screen.getByText("Студенты не найдены")).toBeInTheDocument();
    });
  });

  test("пагинация корректно работает с поиском", async () => {
    render(<StudentsListPage />);
    const input = screen.getByLabelText("Поиск по имени");

    fireEvent.change(input, { target: { value: "2" } });

    await waitFor(() => {
      expect(screen.getByText("Студент 2")).toBeInTheDocument();
      expect(screen.getByText("Студент 12")).toBeInTheDocument();
      expect(screen.queryByText("Студент 1")).not.toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: "2" })).not.toBeInTheDocument();
  });

  test("клик по студенту вызывает navigate с правильным id", async () => {
    render(<StudentsListPage />);
    const studentCard = await screen.findByText("Студент 1");
    fireEvent.click(studentCard);

    expect(mockNavigate).toHaveBeenCalledWith("/profile/student/1");
  });
});