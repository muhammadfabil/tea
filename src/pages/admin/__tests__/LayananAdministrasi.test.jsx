import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KelolaLayanan from "../LayananAdministrasi";

// filepath: src/pages/admin/LayananAdministrasi.test.jsx

describe("KelolaLayanan", () => {
  it("renders without crashing", () => {
    render(<KelolaLayanan />);
    expect(screen.getByText(/Kelola Layanan Administrasi/i)).toBeInTheDocument();
  });

  it("renders the header text", () => {
    render(<KelolaLayanan />);
    expect(screen.getByText(/Mengelola daftar layanan administrasi/i)).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<KelolaLayanan />);
    expect(screen.getByPlaceholderText(/Cari layanan/i)).toBeInTheDocument();
  });

  it("renders the 'Tambah Layanan' button", () => {
    render(<KelolaLayanan />);
    expect(screen.getByRole("button", { name: /Tambah Layanan/i })).toBeInTheDocument();
  });

  

  
});