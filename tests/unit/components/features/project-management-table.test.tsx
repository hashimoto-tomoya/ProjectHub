import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectManagementTable } from "@/components/features/project-management-table";
import type { ProjectListItem } from "@/lib/types/api";

// next/navigation のモック
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const sampleProjects: ProjectListItem[] = [
  {
    id: 1,
    name: "プロジェクトA",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    description: "プロジェクトAの説明",
    pmName: "PM テスト",
    isFavorite: false,
  },
  {
    id: 2,
    name: "プロジェクトB",
    status: "active",
    startDate: "2026-02-01",
    endDate: null,
    description: null,
    pmName: "別PM テスト",
    isFavorite: false,
  },
  {
    id: 3,
    name: "アーカイブプロジェクト",
    status: "archived",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    description: null,
    pmName: "PM テスト",
    isFavorite: false,
  },
];

describe("ProjectManagementTable", () => {
  const mockOnEdit = vi.fn();
  const mockOnArchive = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("プロジェクト一覧が表示される", () => {
    render(
      <ProjectManagementTable
        projects={sampleProjects}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
      />
    );

    expect(screen.getByText("プロジェクトA")).toBeInTheDocument();
    expect(screen.getByText("プロジェクトB")).toBeInTheDocument();
    expect(screen.getByText("アーカイブプロジェクト")).toBeInTheDocument();
  });

  it("PM名と開始日が表示される", () => {
    render(
      <ProjectManagementTable
        projects={sampleProjects}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
      />
    );

    expect(screen.getAllByText("PM テスト")).toHaveLength(2);
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
  });

  it("編集ボタンクリックで onEdit が呼ばれる", async () => {
    render(
      <ProjectManagementTable
        projects={sampleProjects}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /編集/i });
    await userEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(sampleProjects[0]);
  });

  it("アーカイブボタンはアクティブプロジェクトにのみ表示される", () => {
    render(
      <ProjectManagementTable
        projects={sampleProjects}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
      />
    );

    const archiveButtons = screen.getAllByRole("button", { name: /アーカイブ/i });
    // アクティブプロジェクトは2件
    expect(archiveButtons).toHaveLength(2);
  });

  it("アーカイブボタンクリックで onArchive が呼ばれる", async () => {
    render(
      <ProjectManagementTable
        projects={sampleProjects}
        onEdit={mockOnEdit}
        onArchive={mockOnArchive}
      />
    );

    const archiveButtons = screen.getAllByRole("button", { name: /アーカイブ/i });
    await userEvent.click(archiveButtons[0]);

    expect(mockOnArchive).toHaveBeenCalledWith(sampleProjects[0]);
  });

  it("空のプロジェクト一覧の場合は適切なメッセージが表示される", () => {
    render(<ProjectManagementTable projects={[]} onEdit={mockOnEdit} onArchive={mockOnArchive} />);

    expect(screen.getByText(/プロジェクトが見つかりません/i)).toBeInTheDocument();
  });
});
