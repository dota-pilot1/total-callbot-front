import { apiClient } from "../../../shared/api/client";
import axios from "axios";

const API_BASE_URL = "/board";

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    originalName: string;
    storedName: string;
    webPath: string;
    fileSize: number;
    mimeType: string;
  };
  error?: string;
}

export interface MultipleImageUploadResponse {
  success: boolean;
  data?: Array<{
    index: number;
    originalName: string;
    storedName: string;
    webPath: string;
    fileSize: number;
    mimeType: string;
  }>;
  errors?: string[];
}

// 단일 이미지 업로드
export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  console.log("=== 이미지 업로드 시작 ===");
  console.log("파일 정보:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("전체 URL:", `${API_BASE_URL}/images/upload`);

  const formData = new FormData();
  formData.append("file", file);

  // FormData 내용 확인
  console.log("FormData entries:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/images/upload`,
      formData,
      {
        // multipart/form-data의 경우 Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary를 설정함
        // headers: {
        //   "Content-Type": "multipart/form-data",
        // },
      },
    );

    return response.data;
  } catch (error: unknown) {
    console.error("이미지 업로드 실패:", error);

    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ImageUploadResponse;
    }

    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다.",
    };
  }
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (
  files: File[],
): Promise<MultipleImageUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/images/upload-multiple`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    console.error("다중 이미지 업로드 실패:", error);

    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as MultipleImageUploadResponse;
    }

    return {
      success: false,
      errors: ["이미지 업로드 중 오류가 발생했습니다."],
    };
  }
};

// 이미지 삭제 (관리용)
export const deleteImage = async (
  relativePath: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const encodedPath = encodeURIComponent(relativePath);
    const response = await apiClient.delete(
      `${API_BASE_URL}/images/${encodedPath}`,
    );

    return response.data;
  } catch (error: unknown) {
    console.error("이미지 삭제 실패:", error);

    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as { success: boolean; error?: string };
    }

    return {
      success: false,
      error: "이미지 삭제 중 오류가 발생했습니다.",
    };
  }
};
