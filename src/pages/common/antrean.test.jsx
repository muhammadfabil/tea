import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import AntreanDosen from "./AntreanDosen";

// Mock axios
vi.mock("axios");

describe("AntreanDosen Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component correctly", () => {
    render(<AntreanDosen />);
    expect(screen.getByText(/SIMANTAP/i)).toBeInTheDocument();
    expect(screen.getByText(/Status Kehadiran Dosen/i)).toBeInTheDocument();
  });

  it("fetches and displays dosen data", async () => {
    const mockDosenData = [
      {
        id: 1,
        alias: "DSN1",
        status_kehadiran: true,
        keterangan: "Mengajar kelas pagi",
      },
      {
        id: 2,
        alias: "DSN2",
        status_kehadiran: false,
        keterangan: "Sedang cuti",
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockDosenData });

    render(<AntreanDosen />);

    // Wait for the data to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText("DSN1")).toBeInTheDocument();
      expect(screen.getByText("Mengajar kelas pagi")).toBeInTheDocument();
      expect(screen.getByText("DSN2")).toBeInTheDocument();
      expect(screen.getByText("Sedang cuti")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    render(<AntreanDosen />);

    // Wait for the error to be logged
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it("updates dosen status via WebSocket", async () => {
    const mockDosenData = [
      {
        id: 1,
        alias: "DSN1",
        status_kehadiran: false,
        keterangan: "Tidak hadir",
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockDosenData });

    render(<AntreanDosen />);

    // Simulate WebSocket message
    const mockWebSocket = new WebSocket("ws://localhost");
    mockWebSocket.onmessage = vi.fn((event) => {
      const data = JSON.stringify({
        "Inisial Dosen": "DSN1",
        "Status Kehadrian": true,
        "Nama Dosen": "Dosen 1",
        "Keterangan": "Hadir di kampus",
      });
      event.data = data;
    });

    // Wait for the WebSocket message to update the UI
    await waitFor(() => {
      expect(screen.getByText("Hadir di kampus")).toBeInTheDocument();
    });
  });
});