import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TaskStatus, ReviewItemStatus, BugStatus } from "@/lib/types/domain";

describe("StatusBadge", () => {
  describe("TaskStatus の表示", () => {
    const taskStatuses: TaskStatus[] = ["未着手", "進行中", "完了", "保留"];

    taskStatuses.forEach((status) => {
      it(`"${status}" を表示できる`, () => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe("ReviewItemStatus の表示", () => {
    const reviewStatuses: ReviewItemStatus[] = ["未対応", "修正中", "確認待ち", "完了"];

    reviewStatuses.forEach((status) => {
      it(`"${status}" を表示できる`, () => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe("BugStatus の表示", () => {
    const bugStatuses: BugStatus[] = ["未対応", "調査中", "修正中", "確認待ち", "クローズ"];

    bugStatuses.forEach((status) => {
      it(`"${status}" を表示できる`, () => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe("variant prop", () => {
    it("default variant では standalone の border クラスが付かない", () => {
      const { container } = render(<StatusBadge status="完了" variant="default" />);
      const span = container.querySelector("span");
      const classes = span?.className.split(" ") ?? [];
      expect(classes).not.toContain("border");
    });

    it("outline variant では standalone の border クラスが付く", () => {
      const { container } = render(<StatusBadge status="完了" variant="outline" />);
      const span = container.querySelector("span");
      const classes = span?.className.split(" ") ?? [];
      expect(classes).toContain("border");
    });
  });

  it("className prop が渡された場合に適用される", () => {
    const { container } = render(<StatusBadge status="完了" className="test-class" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("test-class");
  });
});
