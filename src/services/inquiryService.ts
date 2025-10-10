import supabase from "../lib/supabase";

export interface Inquiry {
  inquiry_id?: string;
  user_name: string;
  user_email: string;
  user_inquiry: string;
  created_at?: string;
}

export const inquiryService = {
  // Submit a new inquiry
  submitInquiry: async (
    inquiry: Omit<Inquiry, "inquiry_id" | "created_at">
  ): Promise<Inquiry> => {
    try {
      const { data, error } = await supabase
        .from("inquiry")
        .insert([
          {
            user_name: inquiry.user_name,
            user_email: inquiry.user_email,
            user_inquiry: inquiry.user_inquiry,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      throw error;
    }
  },

  // Get all inquiries (for admin)
  getAllInquiries: async (): Promise<Inquiry[]> => {
    try {
      const { data, error } = await supabase
        .from("inquiry")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      throw error;
    }
  },

  // Get inquiry by ID
  getInquiryById: async (inquiry_id: string): Promise<Inquiry> => {
    try {
      const { data, error } = await supabase
        .from("inquiry")
        .select("*")
        .eq("inquiry_id", inquiry_id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      throw error;
    }
  },

  // Delete inquiry (for admin)
  deleteInquiry: async (inquiry_id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("inquiry")
        .delete()
        .eq("inquiry_id", inquiry_id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      throw error;
    }
  },
};
