import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { userApi, authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import trongDongImage from "@/assets/trong.png";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const checkFileSize = (file: File) => {
  return file.size <= MAX_FILE_SIZE;
};

const identificationSchema = z.object({
  front: z
    .instanceof(File, { message: "Vui lòng tải lên CCCD mặt trước" })
    .refine(checkFileSize, "Kích thước ảnh không được vượt quá 10MB"),
  back: z
    .instanceof(File, { message: "Vui lòng tải lên CCCD mặt sau" })
    .refine(checkFileSize, "Kích thước ảnh không được vượt quá 10MB"),
  selfie: z
    .instanceof(File, { message: "Vui lòng tải lên ảnh cầm CCCD" })
    .refine(checkFileSize, "Kích thước ảnh không được vượt quá 10MB"),
});

type IdentificationFormData = z.infer<typeof identificationSchema>;

interface UploadSection {
  id: keyof IdentificationFormData;
  label: string;
  type: "image" | "video";
  preview: string | null;
}

const Identification = () => {
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Clear any existing toasts when component mounts
  useEffect(() => {
    dismiss();
  }, [dismiss]);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IdentificationFormData>({
    resolver: zodResolver(identificationSchema),
    mode: "onSubmit",
  });

  // Fetch user data to pre-fill images
  const { data: userData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authApi.getUser().then((res) => res.data),
  });

  const [uploads, setUploads] = useState<UploadSection[]>([
    {
      id: "front",
      label: "Tải lên CCCD mặt trước:",
      type: "image",
      preview: null,
    },
    {
      id: "back",
      label: "Tải lên CCCD mặt sau:",
      type: "image",
      preview: null,
    },
    {
      id: "selfie",
      label: "Tải lên ảnh cầm CCCD:",
      type: "image",
      preview: null,
    },
  ]);

  // Pre-fill images when data is loaded
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      setUploads((prev) =>
        prev.map((upload) => {
          if (upload.id === "front" && user.front_cccd) {
            return { ...upload, preview: user.front_cccd };
          }
          if (upload.id === "back" && user.back_cccd) {
            return { ...upload, preview: user.back_cccd };
          }
          if (upload.id === "selfie" && user.holding_cccd) {
            return { ...upload, preview: user.holding_cccd };
          }
          return upload;
        }),
      );
    }
  }, [userData]);

  const identityMutation = useMutation({
    mutationFn: (data: IdentificationFormData) => {
      const formData = new FormData();
      formData.append("front", data.front);
      formData.append("back", data.back);
      formData.append("selfie", data.selfie);
      return userApi.identityVerification(formData);
    },
    onSuccess: (response) => {
      const message = response.data?.message || "Gửi yêu cầu xác thực thành công";
      toast({
        title: "Thành công",
        description: message,
        className: "bg-green-500 text-white",
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đã có lỗi xảy ra";
      toast({
        title: "Lỗi",
        description: message,
      });
    },
  });

  const handleFileChange = (
    id: keyof IdentificationFormData,
    file: File | null,
  ) => {
    if (file) {
      setValue(id, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === id
              ? { ...upload, preview: reader.result as string }
              : upload,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (id: keyof IdentificationFormData) => {
    setValue(id, undefined as any);
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, preview: null } : upload,
      ),
    );
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id]!.value = "";
    }
  };

  const onSubmit = (data: IdentificationFormData) => {
    identityMutation.mutate(data);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-red-600 to-red-700 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Xác thực danh tính
          </h1>
          <p className="text-white/90 text-sm">
            Vui lòng tải lên các tài liệu để xác thực danh tính
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white rounded-xl p-4 shadow-lg"
              style={{
                backgroundImage: `url(${trongDongImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundBlendMode: "overlay",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {upload.label}
              </label>

              {upload.preview ? (
                <div className="relative">
                  {upload.type === "image" ? (
                    <img
                      src={upload.preview}
                      alt={upload.label}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={upload.preview}
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(upload.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    ref={(el) => (fileInputRefs.current[upload.id] = el)}
                    type="file"
                    accept={upload.type === "image" ? "image/*" : "video/*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file type
                        const isValid =
                          upload.type === "image"
                            ? file.type.startsWith("image/")
                            : file.type.startsWith("video/");

                        if (!isValid) {
                          toast({
                            title: "Lỗi",
                            description: `Vui lòng chọn file ${upload.type === "image" ? "ảnh" : "video"}`,
                            variant: "destructive",
                          });
                          return;
                        }

                        handleFileChange(upload.id, file);
                      }
                    }}
                    className="hidden"
                    id={`file-${upload.id}`}
                  />
                  <label
                    htmlFor={`file-${upload.id}`}
                    className="cursor-pointer"
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Nhấn để tải lên{" "}
                      {upload.type === "image" ? "ảnh" : "video"}
                    </p>
                  </label>
                </div>
              )}

              {errors[upload.id] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[upload.id]?.message}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={identityMutation.isPending}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold text-lg h-14 rounded-full shadow-lg"
          >
            {identityMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              "Xác thực"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Identification;
