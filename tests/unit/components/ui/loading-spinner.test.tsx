import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

describe("LoadingSpinner", () => {
  it('role="status" が付与されている', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("aria-label が「読み込み中」である", () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
  });

  describe("size prop", () => {
    it("sm サイズのクラスが適用される", () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("h-4");
      expect(el.className).toContain("w-4");
    });

    it("md サイズ（デフォルト）のクラスが適用される", () => {
      const { container } = render(<LoadingSpinner />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("h-8");
      expect(el.className).toContain("w-8");
    });

    it("lg サイズのクラスが適用される", () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain("h-12");
      expect(el.className).toContain("w-12");
    });
  });

  it("className prop が渡された場合に適用される", () => {
    const { container } = render(<LoadingSpinner className="extra-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("extra-class");
  });
});
