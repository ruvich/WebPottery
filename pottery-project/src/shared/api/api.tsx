import type { UserProfile, ApiResponse } from './types/UserProfile';

export const profileApi = {

    getProfile: async (token?: string): Promise<ApiResponse<UserProfile>> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return {
        data: {
          userId: "3fa85f64-5717-4562-b3fc-2c963f66af6e",
          fullName: "Иван Иванов",
          about: "Студент 3 курса, увлекаюсь веб-разработкой"
        },
        status: 200,
        message: "OK"
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (
    data: Partial<UserProfile>, 
    token?: string
  ): Promise<ApiResponse<UserProfile>> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        data: {
          userId: "3fa85f64-5717-4562-b3fc-2c963f66af6e",
          fullName: data.fullName || "Иван Иванов",
          about: data.about || "Студент 3 курса, увлекаюсь веб-разработкой"
        },
        status: 200,
        message: "Profile updated successfully"
      };
      
      // const response = await apiClient.put<ApiResponse<UserProfile>>(
      //   API_ENDPOINTS.UPDATE_PROFILE,
      //   data,
      //   token
      // );
      // return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};