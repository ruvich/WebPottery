import { render, screen, waitFor } from "@testing-library/react";
import { StudentPerformanceBlock } from "./StudentPerformanceBlock";

const mockPerformance = {
  studentId: "123",
  averageGrade: 4.3,
  items: [
    {
      postId: "1",
      postTitle: "Контрольная работа по математике",
      solutionId: "s1",
      grade: { 
        solutionId: "s1",
        score: 5,
        teacherComment: "Отлично!",
        gradedAt: "2026-03-12T11:04:54.089Z",
        teacherId: "t1"
      },
    },
    {
      postId: "2",
      postTitle: "Лабораторная работа по физике",
      solutionId: "s2",
      grade: { 
        solutionId: "s2",
        score: 4,
        teacherComment: "Хорошо",
        gradedAt: "2026-03-12T11:04:54.089Z",
        teacherId: "t2"
      },
    },
  ],
};

jest.mock("../../shared/lib/api/studentPerformanceApi", () => ({
  getStudentPerformance: jest.fn(async () => mockPerformance),
}));

describe("StudentPerformanceBlock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит блок успеваемости и средний балл", async () => {
    render(<StudentPerformanceBlock studentId="123" />);

    await waitFor(() => {
      expect(screen.getByText("Успеваемость")).toBeInTheDocument();
      expect(screen.getByText(/Средний балл/i)).toHaveTextContent("Средний балл: 4.3");
    });
  });

  test("показывает сообщение если данные не загружены", async () => {
    const { getStudentPerformance } = require("../../shared/lib/api/studentPerformanceApi");
    getStudentPerformance.mockResolvedValueOnce(null);

    render(<StudentPerformanceBlock studentId="123" />);

    await waitFor(() => {
      expect(screen.getByText("Данные об успеваемости не найдены")).toBeInTheDocument();
    });
  });
});