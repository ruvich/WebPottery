import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreatePostForm } from "./createPostForm";

const onCloseMock = jest.fn();

import { createPost } from "../../shared/lib/api/createPost";
jest.mock("../../shared/lib/api/createPost", () => ({
  createPost: jest.fn(() => Promise.resolve({})),
}));

describe("CreatePostForm", () => {
  beforeEach(() => jest.clearAllMocks());

  test("рендерит поля формы для MATERIAL", () => {
    render(<CreatePostForm open={true} onClose={onCloseMock} />);

    expect(screen.getByText("Создать пост")).toBeInTheDocument();
    expect(screen.getByLabelText("Название")).toBeInTheDocument();
    expect(screen.getByLabelText("Описание")).toBeInTheDocument();
    expect(screen.getByLabelText("Название материала")).toBeInTheDocument();
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
  });

  test("смена типа на TASK показывает поля задания", () => {
    render(<CreatePostForm open={true} onClose={onCloseMock} />);

    const selectElements = screen.getAllByRole("combobox");
    const typeSelect = selectElements[0];

    fireEvent.mouseDown(typeSelect);
    fireEvent.click(screen.getByText("Задание"));

    expect(screen.getByLabelText("Описание задания")).toBeInTheDocument();
    expect(screen.getByLabelText("Deadline")).toBeInTheDocument();
  });

  test("не отправляет форму если обязательные поля пустые", async () => {
    render(<CreatePostForm open={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText("Создать"));

    await waitFor(() => expect(createPost).not.toHaveBeenCalled());
    expect(screen.getByText(/название поста обязательно/i)).toBeInTheDocument();
  });

  test("смена materialType на TEXT показывает поле текста", () => {
    render(<CreatePostForm open={true} onClose={onCloseMock} />);

    const selects = screen.getAllByRole("combobox");
    const materialSelect = selects[1];

    fireEvent.mouseDown(materialSelect);
    fireEvent.click(screen.getByText("TEXT"));

    expect(screen.getByLabelText("Текст")).toBeInTheDocument();
  });

  test("ввод значений и submit вызывает createPost", async () => {
    render(<CreatePostForm open={true} onClose={onCloseMock} />);

    fireEvent.change(screen.getByLabelText("Название"), { target: { value: "Мой пост" } });
    fireEvent.change(screen.getByLabelText("Описание"), { target: { value: "Описание поста" } });
    fireEvent.change(screen.getByLabelText("Название материала"), { target: { value: "Материал" } });
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: "http://link.com" } });

    fireEvent.click(screen.getByText("Создать"));

    await waitFor(() => expect(createPost).toHaveBeenCalled());
    await waitFor(() => expect(onCloseMock).toHaveBeenCalled());
  });

  test("кнопка Отмена вызывает onClose", () => {
    render(<CreatePostForm open={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText("Отмена"));
    expect(onCloseMock).toHaveBeenCalled();
  });
});