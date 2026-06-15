import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OutfitGenerator } from "@/components/recommendations/OutfitGenerator";
import { RecommendationHistory } from "@/components/recommendations/RecommendationHistory";
import { api } from "@/lib/axios";

// Mock axios
jest.mock("@/lib/axios");
const mockedApi = api as jest.Mocked<typeof api>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const mockHistoryData = {
  success: true,
  data: [
    {
      id: "rec-1",
      user_id: "user-1",
      occasion: "CASUAL",
      top_item: { id: "top-1", name: "White Tee", category: "TOPWEAR", color: "White", image_url: "", season: "SUMMER" },
      bottom_item: { id: "bot-1", name: "Blue Jeans", category: "BOTTOMWEAR", color: "Blue", image_url: "", season: "ALL_SEASON" },
      footwear_item: { id: "shoe-1", name: "Sneakers", category: "FOOTWEAR", color: "White", image_url: "", season: "ALL_SEASON" },
      ai_explanation: "A classic look.",
      weather_snapshot: { temperature_celsius: 25, condition: "Sunny", city: "London", country_code: "GB", weather_used: true, generated_at: "2024-01-01" },
      created_at: "2024-01-01T12:00:00Z",
      updated_at: "2024-01-01T12:00:00Z",
    }
  ],
  pagination: { page: 1, page_size: 10, total_items: 1, total_pages: 1 }
};

describe("Recommendations Features", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("OutfitGenerator", () => {
    it("renders properly and allows submission", async () => {
      mockedApi.post.mockResolvedValueOnce({
        data: { success: true, data: mockHistoryData.data[0] }
      });
      const client = createTestQueryClient();

      render(
        <QueryClientProvider client={client}>
          <OutfitGenerator />
        </QueryClientProvider>
      );

      const generateBtn = screen.getByRole("button", { name: /Generate/i });
      expect(generateBtn).toBeInTheDocument();

      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith("/recommendations/generate", { occasion: "CASUAL" });
      });
    });

    it("displays mapped error on 422 INSUFFICIENT_TOPWEAR", async () => {
      mockedApi.post.mockRejectedValueOnce({
        response: { data: { detail: { error_code: "INSUFFICIENT_TOPWEAR", message: "Error" } } }
      });
      const client = createTestQueryClient();

      render(
        <QueryClientProvider client={client}>
          <OutfitGenerator />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: /Generate/i }));

      await waitFor(() => {
        expect(screen.getByText("You need at least one suitable topwear item before an outfit can be generated.")).toBeInTheDocument();
      });
    });

    it("displays mapped error on 422 NO_VALID_COMBINATION", async () => {
      mockedApi.post.mockRejectedValueOnce({
        response: { data: { detail: { error_code: "NO_VALID_COMBINATION", message: "Error" } } }
      });
      const client = createTestQueryClient();

      render(
        <QueryClientProvider client={client}>
          <OutfitGenerator />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByRole("button", { name: /Generate/i }));

      await waitFor(() => {
        expect(screen.getByText("We couldn't find a compatible outfit combination from your current wardrobe.")).toBeInTheDocument();
      });
    });
  });

  describe("RecommendationHistory", () => {
    it("renders empty state when no history exists", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { success: true, data: [], pagination: { total_items: 0 } } });
      const client = createTestQueryClient();

      render(
        <QueryClientProvider client={client}>
          <RecommendationHistory />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Upload Clothing")).toBeInTheDocument();
      });
    });

    it("renders history cards when data is available", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockHistoryData });
      const client = createTestQueryClient();

      render(
        <QueryClientProvider client={client}>
          <RecommendationHistory />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("CASUAL Outfit")).toBeInTheDocument();
        expect(screen.getByText("A classic look.")).toBeInTheDocument();
        expect(screen.getByText(/25°C/)).toBeInTheDocument(); // Weather badge
      });
    });
  });
});
