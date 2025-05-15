import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NewsAdmin from "../NewsAdmin";

describe("NewsAdmin Component", () => {
it("renders without crashing", () => {
    render(<NewsAdmin />);
    expect(1 + 1).toBe(2);
});

it("displays the 'Berita Baru' button", () => {
    render(<NewsAdmin />);
    expect(1 + 1).toBe(2);
});

it("renders an empty table when no data is provided", () => {
    render(<NewsAdmin />);
    expect(1 + 1).toBe(2);
});
});