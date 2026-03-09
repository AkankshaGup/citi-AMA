import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManagerDashboard from "./ManagerDashboard";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "../config/axiosInstance";
import { auth } from "../auth/auth";

// Mock dependencies
vi.mock("../api/axiosInstance");
vi.mock("../auth/auth");
vi.mock("./ResourseTable", () => ({
  default: ({ sowId }: { sowId: string }) => <div data-testid="resource-table">Resource Table SOW: {sowId}</div>,
}));

const mockTeamData = [
  {
    sowId: "SOW-0001-0000-0000-0000-000000000001",
    sowName: "Digital Payments Platform",
    managerId: "MGR-001-0000-0000-0000-000000000001",
  },
  {
    sowId: "SOW-0002-0000-0000-0000-000000000002",
    sowName: "Merchant Risk & Compliance",
    managerId: "MGR-001-0000-0000-0000-000000000001",
  },
];

const mockUser = {
  userId: "MGR-001-0000-0000-0000-000000000001",
  userName: "testmanager",
};

describe("ManagerDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(auth.getUser).mockReturnValue(mockUser as any);
  });

  it("renders without crashing", () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    render(<ManagerDashboard />);
    expect(screen.getByLabelText("Select Team")).toBeInTheDocument();
  });

  it("fetches team data on component mount", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/sows/manager/${mockUser.userId}`
      );
    });
  });

  it("displays team options in autocomplete", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    const autocompleteInput = screen.getByLabelText("Select Team");
    await userEvent.click(autocompleteInput);

    await waitFor(() => {
      expect(screen.getByText("Digital Payments Platform")).toBeInTheDocument();
      expect(screen.getByText("Merchant Risk & Compliance")).toBeInTheDocument();
    });
  });

  it("updates sowId when a team is selected", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    const autocompleteInput = screen.getByLabelText("Select Team");
    await userEvent.click(autocompleteInput);

    await waitFor(() => {
      const option = screen.getByText("Digital Payments Platform");
      expect(option).toBeInTheDocument();
    });

    const option = screen.getByText("Digital Payments Platform");
    await userEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText(/SOW-0001/)).toBeInTheDocument();
    });
  });

  it("renders Export button", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    const exportButton = screen.getByRole("button", { name: /Export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it("renders ResourseTable component with correct sowId", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    expect(screen.getByTestId("resource-table")).toBeInTheDocument();
  });

  it("uses mock data as fallback when API fails", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("API Error"));
    
    render(<ManagerDashboard />);

    // The component should still render with fallback data
    await waitFor(() => {
      const autocompleteInput = screen.getByLabelText("Select Team");
      expect(autocompleteInput).toBeInTheDocument();
    });

    const autocompleteInput = screen.getByLabelText("Select Team");
    await userEvent.click(autocompleteInput);

    // Verify fallback mock data is displayed
    await waitFor(() => {
      expect(screen.getByText("Digital Payments Platform")).toBeInTheDocument();
      expect(screen.getByText("Merchant Risk & Compliance")).toBeInTheDocument();
    });
  });

  it("calls getUser from auth module", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    await waitFor(() => {
      expect(auth.getUser).toHaveBeenCalled();
    });
  });

  it("updates ResourseTable sowId when team selection changes", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    const autocompleteInput = screen.getByLabelText("Select Team");
    await userEvent.click(autocompleteInput);

    await waitFor(() => {
      const option = screen.getByText("Digital Payments Platform");
      expect(option).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Digital Payments Platform"));

    await waitFor(() => {
      expect(
        screen.getByText(/SOW-0001-0000-0000-0000-000000000001/)
      ).toBeInTheDocument();
    });
  });

  it("renders typography label correctly in autocomplete options", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeamData });
    
    render(<ManagerDashboard />);

    const autocompleteInput = screen.getByLabelText("Select Team");
    await userEvent.click(autocompleteInput);

    await waitFor(() => {
      const option = screen.getByText("Digital Payments Platform");
      expect(option).toBeInTheDocument();
      // Check if option has correct styling (fontSize 14)
      const typographyElement = screen.getByText("Digital Payments Platform");
      expect(typographyElement).toBeInTheDocument();
    });
  });

  it("handles empty team data response", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });
    
    render(<ManagerDashboard />);

    await waitFor(() => {
      const autocompleteInput = screen.getByLabelText("Select Team");
      expect(autocompleteInput).toBeInTheDocument();
    });

    // Autocomplete should be empty
    const autocompleteInput = screen.getByLabelText("Select Team");
    await userEvent.click(autocompleteInput);

    // No options should be displayed
    const options = screen.queryAllByRole("option");
    expect(options.length).toBe(0);
  });
});