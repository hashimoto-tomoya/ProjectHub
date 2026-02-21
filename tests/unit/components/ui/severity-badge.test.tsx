import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { Severity } from "@/lib/types/domain";

describe("SeverityBadge", () => {
  const severities: Severity[] = ["致命的", "高", "中", "低"];

  severities.forEach((severity) => {
    it(`"${severity}" を表示できる`, () => {
      render(<SeverityBadge severity={severity} />);
      expect(screen.getByText(severity)).toBeInTheDocument();
    });
  });

  it('"致命的" は赤系のクラスを持つ', () => {
    const { container } = render(<SeverityBadge severity="致命的" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("red");
  });

  it('"高" はオレンジ系のクラスを持つ', () => {
    const { container } = render(<SeverityBadge severity="高" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("orange");
  });

  it('"中" は黄色系のクラスを持つ', () => {
    const { container } = render(<SeverityBadge severity="中" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("yellow");
  });

  it('"低" は緑系のクラスを持つ', () => {
    const { container } = render(<SeverityBadge severity="低" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("green");
  });

  it("className prop が渡された場合に適用される", () => {
    const { container } = render(<SeverityBadge severity="高" className="custom-class" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("custom-class");
  });
});
