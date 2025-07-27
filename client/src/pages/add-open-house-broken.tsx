import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clipboard, Upload, X, ExternalLink, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { parseClipboard } from "@/lib/utils";
import { insertOpenHouseSchema, type InsertOpenHouse, type OpenHouse } from "@shared/schema";

interface AddOpenHouseProps {
  onNavigate: (path: string) => void;
  editingOpenHouse?: OpenHouse;
}

export function AddOpenHouse({ onNavigate, editingOpenHouse }: AddOpenHouseProps) {
  const [clipboardText, setClipboardText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageForParsing, setImageForParsing] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertOpenHouse>({
    resolver: zodResolver(insertOpenHouseSchema),
    defaultValues: editingOpenHouse ? {
      address: editingOpenHouse.address,
      price: editingOpenHouse.price,
      zestimate: editingOpenHouse.zestimate || "",
      date: editingOpenHouse.date,
      time: editingOpenHouse.time,
      imageUrl: editingOpenHouse.imageUrl || "",
      imageData: editingOpenHouse.imageData || "",
      notes: editingOpenHouse.notes || "",
      visited: editingOpenHouse.visited,
      favorited: editingOpenHouse.favorited,
    } : {
      address: "",
      price: "",
      zestimate: "",
      date: "",
      time: "",
      imageUrl: "",
      imageData: "",
      notes: "",
      visited: false,
      favorited: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertOpenHouse) => {
      await apiRequest("POST", "/api/open-houses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Open house saved successfully!" });
      onNavigate("home");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save open house",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertOpenHouse) => {
      await apiRequest("PATCH", `/api/open-houses/${editingOpenHouse!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Open house updated successfully!" });
      onNavigate("home");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update open house",
        variant: "destructive",
      });
    },
  });

  const parseClipboardMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/parse-clipboard", { text });
      return response.json();
    },
    onSuccess: (parsedData) => {
      if (parsedData.address) form.setValue("address", parsedData.address);
      if (parsedData.price) form.setValue("price", parsedData.price);
      if (parsedData.zestimate) form.setValue("zestimate", parsedData.zestimate);
      if (parsedData.date) form.setValue("date", parsedData.date);
      if (parsedData.time) form.setValue("time", parsedData.time);
      if (parsedData.notes) form.setValue("notes", parsedData.notes);
      
      // Handle automatically extracted images from property URLs
      if (parsedData.imageUrl) {
        form.setValue("imageUrl", parsedData.imageUrl);
        setImagePreview(parsedData.imageUrl);
        toast({ title: "Property details and image extracted successfully!" });
      } else {
        toast({ title: "Clipboard data parsed successfully!" });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to parse clipboard data",
        variant: "destructive",
      });
    },
  });

  const parseImageMutation = useMutation({
    mutationFn: async (imageData: string | null) => {
      if (!imageData) throw new Error("No image provided");
      
      // Import Tesseract dynamically
      const Tesseract = (await import('tesseract.js')).default;
      
      // Perform OCR on the image
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log(m) // Optional: log progress
      });
      
      // Parse the extracted text using existing clipboard parsing logic
      const response = await apiRequest("POST", "/api/parse-clipboard", { text });
      return await response.json();
    },
    onSuccess: (parsedData) => {
      if (parsedData.address) form.setValue("address", parsedData.address);
      if (parsedData.price) form.setValue("price", parsedData.price);
      if (parsedData.zestimate) form.setValue("zestimate", parsedData.zestimate);
      if (parsedData.date) {
        form.setValue("date", parsedData.date);
      } else {
        // Clear date field if no date was found in the image
        form.setValue("date", "");
      }
      if (parsedData.time) {
        form.setValue("time", parsedData.time);
      } else {
        // Clear time field if no time was found in the image
        form.setValue("time", "");
      }
      if (parsedData.notes) form.setValue("notes", parsedData.notes);
      
      // Handle automatically extracted images from property URLs
      if (parsedData.imageUrl) {
        form.setValue("imageUrl", parsedData.imageUrl);
        setImagePreview(parsedData.imageUrl);
        toast({ title: "Property details and image extracted successfully!" });
      } else {
        toast({ title: "Text extracted from image successfully!" });
      }
    },
    onError: (error) => {
      console.error("OCR Error:", error);
      toast({
        title: "Error",
        description: "Failed to extract text from image. Try using manual copy/paste instead.",
        variant: "destructive",
      });
    },
  });

  // Utility function to process image files consistently
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageForParsing(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePasteFromClipboard = async () => {
    const text = await parseClipboard();
    if (text) {
      setClipboardText(text);
      parseClipboardMutation.mutate(text);
    } else {
      toast({
        title: "Error",
        description: "Failed to read from clipboard",
        variant: "destructive",
      });
    }
  };

  const handleImagePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          processImageFile(file);
        }
        break;
      }
    }
  };

  const handlePasteImageForOCR = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], 'clipboard-image', { type });
            processImageFile(file);
            return;
          }
        }
      }
      // No image found in clipboard
      toast({
        title: "No image found",
        description: "Please copy an image to your clipboard first",
        variant: "destructive"
      });
    } catch (error) {
      // Fallback: trigger file input for mobile devices
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          processImageFile(file);
        }
      };
      input.click();
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImageForParsing(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Effect to trigger OCR when image is set
  useEffect(() => {
    if (imageForParsing) {
      parseImageMutation.mutate(imageForParsing);
      setImageForParsing(null); // Reset after processing
    }
  }, [imageForParsing]);

  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const resizedImage = await resizeImage(file);
      setImagePreview(resizedImage);
      form.setValue('imageData', resizedImage);
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('imageData', '');
  };

  const onSubmit = (data: InsertOpenHouse) => {
    if (editingOpenHouse) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen">
      <header className="modern-header sticky top-0 z-50">
        <div className="flex items-center px-6 py-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("home")}
            className="p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white transition-all duration-300 text-gray-700 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text font-['Playfair_Display']">
              {editingOpenHouse ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              {editingOpenHouse ? "Update property details" : "Track your next open house visit"}
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 pt-8 pb-24">
        <div className="floating-card animate-fade-in">
          <div className="p-8">
            {!editingOpenHouse && (
              <>
                {/* Image Parser Section */}
                <div className="glass-effect rounded-2xl p-6 mb-8 border border-purple-200">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Smart Image Parser</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Capture or paste a screenshot of any property listing to automatically extract all the details.
                      </p>
                    </div>
                  </div>
                    <div 
                      className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center mb-3"
                      onPaste={handleImagePaste}
                      onDrop={handleImageDrop}
                      onDragOver={(e) => e.preventDefault()}
                      tabIndex={0}
                    >
                      {imageForParsing ? (
                        <div className="relative">
                          <img 
                            src={imageForParsing} 
                            alt="Listing screenshot" 
                            className="max-w-full h-32 object-cover rounded mx-auto mb-2"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setImageForParsing(null)}
                            className="text-xs"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Camera className="mx-auto h-8 w-8 text-purple-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Paste screenshot (Ctrl+V) or drag image here
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const clipboardItems = await navigator.clipboard.read();
                                for (const item of clipboardItems) {
                                  for (const type of item.types) {
                                    if (type.startsWith('image/')) {
                                      const blob = await item.getType(type);
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const result = event.target?.result as string;
                                        setImageForParsing(result);
                                      };
                                      reader.readAsDataURL(blob);
                                      return;
                                    }
                                  }
                                }
                                toast({
                                  title: "No image found",
                                  description: "Please copy an image to your clipboard first",
                                  variant: "destructive"
                                });
                              } catch (error) {
                                toast({
                                  title: "Clipboard access not available",
                                  description: "Please use drag and drop or paste with Ctrl+V instead",
                                  variant: "destructive"
                                });
                              }
                            }}
                            className="text-xs bg-white hover:bg-purple-50 border-purple-300"
                          >
                            Paste from Clipboard
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => parseImageMutation.mutate(imageForParsing)}
                      disabled={!imageForParsing || parseImageMutation.isPending}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                      {parseImageMutation.isPending ? "Extracting from Image..." : "Extract from Image"}
                    </Button>
                    <div className="text-sm text-purple-700 bg-purple-100 p-3 rounded-xl mt-4">
                      <strong>Pro Tip:</strong> Screenshot any listing page and paste it here for instant data extraction.
                    </div>
                  </div>
                </div>

                {/* Manual Clipboard Section */}
                <div className="glass-effect rounded-2xl p-6 mb-8 border border-blue-200">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                      <Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">Quick Text Parser</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Copy listing details from any website and paste here for instant parsing.
                      </p>
                    </div>
                  </div>
                  <Textarea
                      placeholder="Paste listing details here...

Try copying text like:
'$850,000 - 123 Main Street, Anytown CA 90210
Open House: Saturday, January 15th 2:00 PM - 4:00 PM
Beautiful 3BR/2BA home with garden'"
                      value={clipboardText}
                      onChange={(e) => setClipboardText(e.target.value)}
                      className="mb-3 h-32 resize-none"
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => parseClipboardMutation.mutate(clipboardText)}
                        disabled={!clipboardText || parseClipboardMutation.isPending}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {parseClipboardMutation.isPending ? "Parsing..." : "Parse Details"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePasteFromClipboard}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Paste from Clipboard
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const sampleText = "$468,000\n35 WOODHOLLOW Lane, Palm Coast, FL 32164\nSat, Jun 21\n11:00 AM - 1:00 PM";
                          setClipboardText(sampleText);
                          parseClipboardMutation.mutate(sampleText);
                        }}
                        className="border-green-200 text-green-600 hover:bg-green-50 text-xs"
                      >
                        Try Sample
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Property Image
                  </FormLabel>
                  
                  {/* Image Upload/Paste Area */}
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors focus-within:border-blue-400"
                    onPaste={handleImagePaste}
                    tabIndex={0}
                    onClick={() => {
                      // Focus the div to enable paste events
                      const target = document.getElementById('image-paste-area');
                      target?.focus();
                    }}
                    id="image-paste-area"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Property preview" 
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-6 h-6 p-0 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">
                          Drag an image here, paste from clipboard, or click to upload
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Choose Image
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const clipboardItems = await navigator.clipboard.read();
                                for (const item of clipboardItems) {
                                  for (const type of item.types) {
                                    if (type.startsWith('image/')) {
                                      const blob = await item.getType(type);
                                      const file = new File([blob], 'pasted-image', { type });
                                      const resizedImage = await resizeImage(file);
                                      setImagePreview(resizedImage);
                                      form.setValue('imageData', resizedImage);
                                      toast({ title: "Image pasted successfully!" });
                                      return;
                                    }
                                  }
                                }
                                toast({
                                  title: "No image found",
                                  description: "Copy an image to your clipboard first",
                                  variant: "destructive",
                                });
                              } catch (error) {
                                toast({
                                  title: "Paste failed",
                                  description: "Unable to access clipboard. Try using Ctrl+V instead.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Clipboard className="h-4 w-4 mr-1" />
                            Paste Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Input as fallback */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-500">
                          Link to Home Listing
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://..."
                            {...field}
                            value={field.value || ""}
                            className="border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Property Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter full address..."
                          {...field}
                          className="border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Listing Price
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                            <Input
                              placeholder="399900"
                              {...field}
                              className="pl-8 border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zestimate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Zestimate
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                            <Input
                              placeholder="387100"
                              {...field}
                              value={field.value || ""}
                              className="pl-8 border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                            placeholder="Select date"
                            className="border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2:00-4:00 PM"
                            {...field}
                            className="border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Notes (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this property..."
                          {...field}
                          value={field.value || ""}
                          className="h-24 resize-none border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onNavigate("home")}
                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : (editingOpenHouse ? "Update Open House" : "Save Open House")}
                  </Button>
                </div>
              </form>
            </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
