import axios from 'axios';

const API_BASE_URL = 'https://praposal-builder-api.kodedice.com';

export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  message?: string;
  error?: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/common/file/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Extract filePath from the nested data structure and construct full URL
    const filePath = response.data.data?.filePath;
    const fullUrl = filePath ? `${API_BASE_URL}/${filePath.replace(/^\//, '')}` : undefined;
    
    return {
      success: true,
      fileUrl: fullUrl,
      message: response.data.msg || response.data.message,
    };
  } catch (error: any) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Upload failed',
    };
  }
};
