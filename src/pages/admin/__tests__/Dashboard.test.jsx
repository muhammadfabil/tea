import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminDashboard from "../Dashboard";
import { useAuth } from "../../../context/AuthContext";

// filepath: src/pages/admin/Dashboard.test.jsx

// Mock the AuthContext
vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    // Mock the user data
    vi.mocked(useAuth).mockReturnValue({ user: { name: "Test Admin" } });
  });

  it("renders the dashboard correctly", () => {
    render(<AdminDashboard />);

    // Check for welcome message
    expect(screen.getByText(/Selamat Datang, Test Admin/i)).toBeInTheDocument();

    // Check for stats cards
    expect(screen.getByText(/Jumlah Mahasiswa/i)).toBeInTheDocument();
    expect(screen.getByText(/Dosen Aktif/i)).toBeInTheDocument();
    expect(screen.getByText(/Layanan Tersedia/i)).toBeInTheDocument();
    expect(screen.getByText(/Pengajuan Menunggu/i)).toBeInTheDocument();

    // Check for "Lihat Semua" button
    expect(screen.getByRole("link", { name: /Lihat Semua/i })).toBeInTheDocument();
  });
});