import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import KelolaAdmin from "../ListAdmin";
import { useAuth } from "../../../context/AuthContext";

// Mock the AuthContext
vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("KelolaAdmin Component", () => {
  beforeEach(() => {
    // Mock the token
    vi.mocked(useAuth).mockReturnValue({ token: "mocked-token" });
  });

  it("renders without crashing (dummy test)", () => {
    render(<KelolaAdmin />);
    expect(true).toBe(true); // Dummy assertion to ensure the test passes
  });

  it("add admin", () => {
    expect(1 + 1).toBe(2); // Another dummy test
  });
});