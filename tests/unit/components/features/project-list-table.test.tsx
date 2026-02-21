import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectListTable } from "@/components/features/project-list-table";
import type { ProjectListItem } from "@/lib/types/api";

// TanStack Query のモック
const mockMutate = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

// next/navigation のモック
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// global fetch のモック
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const sampleProjects: ProjectListItem[] = [
  {
    id: 1,
    name: "プロジェクトA",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    pmName: "PM テスト",
    isFavorite: true,
  },
  {
    id: 2,
    name: "プロジェクトB",
    status: "active",
    startDate: "2026-02-01",
    endDate: null,
    pmName: "別PM テスト",
    isFavorite: false,
  },
  {
    id: 3,
    name: "アーカイブプロジェクト",
    status: "archived",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    pmName: "PM テスト",
    isFavorite: false,
  },
];

describe("ProjectListTable", () => {
  const mockOnFavoriteToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("プロジェクト一覧が表示される", () => {
    render(
      <ProjectListTable
        projects={sampleProjects}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    expect(screen.getByText("プロジェクトA")).toBeInTheDocument();
    expect(screen.getByText("プロジェクトB")).toBeInTheDocument();
    expect(screen.getByText("アーカイブプロジェクト")).toBeInTheDocument();
  });

  it("PM名が表示される", () => {
    render(
      <ProjectListTable
        projects={sampleProjects}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    expect(screen.getAllByText("PM テスト")).toHaveLength(2);
    expect(screen.getByText("別PM テスト")).toBeInTheDocument();
  });

  it("プロジェクト名で検索フィルタが動作する", async () => {
    render(
      <ProjectListTable
        projects={sampleProjects}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    const searchInput = screen.getByPlaceholderText(/検索/i);
    await userEvent.type(searchInput, "プロジェクトA");

    expect(screen.getByText("プロジェクトA")).toBeInTheDocument();
    expect(screen.queryByText("プロジェクトB")).not.toBeInTheDocument();
  });

  it("お気に入りボタンクリックで onFavoriteToggle が呼ばれる", async () => {
    render(
      <ProjectListTable
        projects={sampleProjects}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    // お気に入りボタン（プロジェクトBの☆ボタン）をクリック
    const favoriteButtons = screen.getAllByRole("button", { name: /お気に入り/i });
    await userEvent.click(favoriteButtons[0]);

    expect(mockOnFavoriteToggle).toHaveBeenCalled();
  });

  it("お気に入り登録済みプロジェクトは filled star アイコンで表示される", () => {
    render(
      <ProjectListTable
        projects={sampleProjects}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    // isFavorite: true のプロジェクトAは filled star
    const favoriteButtons = screen.getAllByRole("button", { name: /お気に入り/i });
    // 最初のボタン（プロジェクトA）は aria-label に "解除" を含む
    expect(favoriteButtons[0]).toHaveAttribute("aria-label", expect.stringContaining("解除"));
  });

  it("プロジェクト行をクリックするとダッシュボードに遷移する", async () => {
    render(
      <ProjectListTable
        projects={sampleProjects}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    await userEvent.click(screen.getByText("プロジェクトA"));

    expect(mockRouterPush).toHaveBeenCalledWith("/projects/1/dashboard");
  });

  it("空のプロジェクト一覧の場合は適切なメッセージが表示される", () => {
    render(
      <ProjectListTable
        projects={[]}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );

    expect(screen.getByText(/プロジェクトが見つかりません/i)).toBeInTheDocument();
  });
});
