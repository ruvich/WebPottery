import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { TeamsPage } from "./TeamsPage";
import * as teamsApi from "../../shared/lib/api/teams";
import * as postApi from "../../shared/lib/api/createPost";

const mockParams = { postId: "test-post-id" };

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useParams: () => mockParams,
}));

jest.mock("../../shared/lib/api/teams", () => ({
  getTeamDetails: jest.fn(),
  joinTeam: jest.fn(),
  leaveTeam: jest.fn(),
}));

jest.mock("../../shared/lib/api/createPost", () => ({
  fetchPostById: jest.fn(),
}));

const mockTeams = [
  {
    id: "team-1",
    name: "Team 1",
    members: [
      { id: "user-1", fullName: "Я" },
      { id: "user-2", fullName: "Друг" },
    ],
  },
  {
    id: "team-2",
    name: "Team 2",
    members: [{ id: "user-3", fullName: "Друг 2" }],
  },
];

beforeEach(() => {
  localStorage.setItem("userId", "user-1");
  localStorage.setItem("userRole", "STUDENT");

  (teamsApi.getTeamDetails as jest.Mock).mockResolvedValue(mockTeams);

  (postApi.fetchPostById as jest.Mock).mockResolvedValue({
    task: {
      teamRules: {
        maxMembersPerTeam: 5,
        formationDeadline: new Date(Date.now() + 1000000).toISOString(),
      },
    },
  });

  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("TeamsPage", () => {
  test("показывает команды после загрузки", async () => {
    render(<TeamsPage />);

    expect(await screen.findByText("Team 1")).toBeInTheDocument();
    expect(screen.getByText("Team 2")).toBeInTheDocument();
  });

  test("подсвечивает текущего пользователя", async () => {
    render(<TeamsPage />);

    const me = await screen.findByText("Я");
    expect(me).toBeInTheDocument();
  });

  test("показывает кнопку 'Покинуть' для своей команды", async () => {
    render(<TeamsPage />);

    const leaveBtn = await screen.findByRole("button", { name: /покинуть/i });
    expect(leaveBtn).toBeInTheDocument();
  });

  test("НЕ показывает кнопку 'Вступить', если уже в команде", async () => {
    render(<TeamsPage />);

    await screen.findByText("Team 1");

    const joinBtn = screen.queryByRole("button", { name: /вступить/i });
    expect(joinBtn).not.toBeInTheDocument();
  });

  test("вступление вызывает API", async () => {
    localStorage.setItem("userId", "new-user");

    render(<TeamsPage />);

    await screen.findByText("Team 1");

    const joinButtons = screen.getAllByRole("button", { name: /вступить/i });

    fireEvent.click(joinButtons[0]); // нажимаем первую

    await waitFor(() => {
        expect(teamsApi.joinTeam).toHaveBeenCalled();
    });
  });

  test("выход вызывает API", async () => {
    render(<TeamsPage />);

    const leaveBtn = await screen.findByRole("button", { name: /покинуть/i });

    fireEvent.click(leaveBtn);

    await waitFor(() => {
      expect(teamsApi.leaveTeam).toHaveBeenCalled();
    });
  });

  test("блокирует вступление если команда заполнена", async () => {
    (teamsApi.getTeamDetails as jest.Mock).mockResolvedValue([
      {
        id: "team-1",
        name: "Team 1",
        members: Array.from({ length: 5 }, (_, i) => ({
          id: `u${i}`,
          fullName: `User ${i}`,
        })),
      },
    ]);

    localStorage.setItem("userId", "new-user");

    render(<TeamsPage />);

    const btn = await screen.findByRole("button", { name: /вступить/i });

    expect(btn).toBeDisabled();
  });

  test("блокирует действия после дедлайна", async () => {
    (postApi.fetchPostById as jest.Mock).mockResolvedValue({
      task: {
        teamRules: {
          maxMembersPerTeam: 5,
          formationDeadline: new Date(Date.now() - 100000).toISOString(),
        },
      },
    });

    render(<TeamsPage />);

    const leaveBtn = await screen.findByRole("button", { name: /покинуть/i });

    expect(leaveBtn).toBeDisabled();
  });

  test("скрывает кнопки для TEACHER", async () => {
    localStorage.setItem("userRole", "TEACHER");

    render(<TeamsPage />);

    await screen.findByText("Team 1");

    expect(screen.queryByRole("button", { name: /вступить/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /покинуть/i })).toBeNull();
  });
});