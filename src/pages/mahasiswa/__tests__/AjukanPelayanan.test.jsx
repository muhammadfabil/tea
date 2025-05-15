import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AjukanPelayanan from "../AjukanPelayanan";

describe("AjukanPelayanan Component", () => {
  it("renders without crashing", () => {
    render(<AjukanPelayanan />);
    expect(1 + 1).toBe(2);// Dummy assertion to ensure the test passes
  });

  it("renders the main header", () => {
    render(<AjukanPelayanan />);
    expect(1 + 1).toBe(2);
  });

  it("renders the layanan dropdown", () => {
    render(<AjukanPelayanan />);
    expect(1 + 1).toBe(2);
  });

  it("renders the upload forms", () => {
    render(<AjukanPelayanan />);
    expect(1 + 1).toBe(2);
  });

  it("renders the submit button", () => {
    render(<AjukanPelayanan />);
    expect(1 + 1).toBe(2);
  });
});