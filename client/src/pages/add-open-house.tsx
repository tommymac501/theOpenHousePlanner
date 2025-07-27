import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, ArrowLeft, Clipboard, Link } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OpenHouse, InsertOpenHouse } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOpenHouseSchema } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

interface AddOpenHouseProps {
  onNavigate: (path: string) => void;
  editingOpenHouse?: OpenHouse;
}

export function AddOpenHouse({ onNavigate, editingOpenHouse }: AddOpenHouseProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [clipboardText, setClipboardText] = useState("");
  const [ocrImageData, setOcrImageData] = useState<string>("");

  // Handle keyboard paste events for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste when form is visible and no input is focused
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      const clipboardItems = e.clipboardData?.items;
      if (clipboardItems) {
        for (let i = 0; i < clipboardItems.length; i++) {
          const item = clipboardItems[i];
          if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
              processImageFile(file);
              toast({
                title: "Image pasted successfully",
                description: "Property image added via Ctrl+V",
              });
            }
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const form = useForm<z.infer<typeof insertOpenHouseSchema>>({
    resolver: zodResolver(insertOpenHouseSchema),
    defaultValues: {
      address: editingOpenHouse?.address || "",
      price: editingOpenHouse?.price || "",
      zestimate: editingOpenHouse?.zestimate || "",
      monthlyPayment: editingOpenHouse?.monthlyPayment || "",
      date: editingOpenHouse?.date || new Date().toISOString().split('T')[0],
      time: editingOpenHouse?.time || "",
      notes: editingOpenHouse?.notes || "",
      imageUrl: editingOpenHouse?.imageUrl || "",
      imageData: editingOpenHouse?.imageData || "",
      listingUrl: editingOpenHouse?.listingUrl || "",
      visited: editingOpenHouse?.visited || false,
      favorited: editingOpenHouse?.favorited || false,
      disliked: editingOpenHouse?.disliked || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertOpenHouse) => {
      const response = await apiRequest("POST", "/api/open-houses", data);
      return response.json();
    },
    onSuccess: () => {
      // Force refetch of all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/open-houses"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
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
      const response = await apiRequest("PATCH", `/api/open-houses/${editingOpenHouse!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Force refetch of all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/open-houses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/open-houses"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
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
      const response = await apiRequest("POST", "/api/parse-listing", { text });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.address) form.setValue("address", data.address);
      if (data.price) form.setValue("price", data.price);
      if (data.zestimate) form.setValue("zestimate", data.zestimate);
      if (data.monthlyPayment) form.setValue("monthlyPayment", data.monthlyPayment);
      if (data.date) form.setValue("date", data.date);
      if (data.time) form.setValue("time", data.time);
      if (data.imageUrl) form.setValue("imageUrl", data.imageUrl);
      if (data.notes) form.setValue("notes", data.notes);
      
      toast({ title: "Details parsed successfully!" });
      setClipboardText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to parse listing details",
        variant: "destructive",
      });
    },
  });

  const ocrParseMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/ocr-parse", { imageData });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.address) form.setValue("address", data.address);
      if (data.price) form.setValue("price", data.price);
      if (data.zestimate) form.setValue("zestimate", data.zestimate);
      if (data.monthlyPayment) form.setValue("monthlyPayment", data.monthlyPayment);
      if (data.date) form.setValue("date", data.date);
      if (data.time) form.setValue("time", data.time);
      if (data.imageUrl) form.setValue("imageUrl", data.imageUrl);
      if (data.notes) form.setValue("notes", data.notes);
      
      toast({ title: "Image parsed successfully!" });
      setOcrImageData("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to parse image",
        variant: "destructive",
      });
    },
  });





  const onSubmit = (data: z.infer<typeof insertOpenHouseSchema>) => {
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
            <h1 className="text-2xl font-bold gradient-text font-['Outfit']">
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
                {/* Paste Listing OCR Section */}
                <div className="glass-effect rounded-2xl p-6 mb-8 border border-green-200">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
                      <Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Outfit']">Paste listing</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Paste a screenshot of any property listing to automatically extract all details.
                      </p>
                    </div>
                  </div>
                  
                  {ocrImageData ? (
                    <div className="relative mb-4">
                      <img 
                        src={ocrImageData} 
                        alt="Property listing" 
                        className="w-full max-w-md h-48 object-cover rounded-xl border mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setOcrImageData("")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="text-center p-6 border-2 border-dashed border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 mb-4"
                      tabIndex={0}
                      onPaste={(e) => {
                        e.preventDefault();
                        const items = e.clipboardData?.items;
                        if (!items) return;
                        
                        for (let i = 0; i < items.length; i++) {
                          const item = items[i];
                          if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setOcrImageData(event.target?.result as string);
                                toast({ title: "Image pasted successfully!" });
                              };
                              reader.readAsDataURL(file);
                              return;
                            }
                          }
                        }
                        toast({
                          title: "No image found",
                          description: "Please copy an image first",
                          variant: "destructive",
                        });
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer?.files;
                        if (!files || files.length === 0) return;
                        
                        const file = files[0];
                        if (file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setOcrImageData(event.target?.result as string);
                            toast({ title: "Image uploaded successfully!" });
                          };
                          reader.readAsDataURL(file);
                        } else {
                          toast({
                            title: "Invalid file type",
                            description: "Please upload an image file",
                            variant: "destructive",
                          });
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <p className="text-gray-600 mb-4">
                        Click here and paste a listing screenshot (Ctrl+V or Cmd+V) or drag & drop
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl px-6 py-3"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard && navigator.clipboard.read) {
                              const clipboardItems = await navigator.clipboard.read();
                              for (const clipboardItem of clipboardItems) {
                                for (const type of clipboardItem.types) {
                                  if (type.startsWith('image/')) {
                                    const blob = await clipboardItem.getType(type);
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setOcrImageData(e.target?.result as string);
                                      toast({ title: "Image pasted successfully!" });
                                    };
                                    reader.readAsDataURL(blob);
                                    return;
                                  }
                                }
                              }
                              toast({
                                title: "No image found",
                                description: "Please copy an image first",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Use keyboard paste",
                                description: "Click in this area and press Ctrl+V (or Cmd+V on Mac)",
                                variant: "default",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Use keyboard paste",
                              description: "Click in this area and press Ctrl+V (or Cmd+V on Mac)",
                              variant: "default",
                            });
                          }
                        }}
                      >
                        Paste Screenshot
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex">
                    <Button
                      type="button"
                      onClick={() => ocrParseMutation.mutate(ocrImageData)}
                      disabled={!ocrImageData || ocrParseMutation.isPending}
                      className="luxury-button w-full"
                    >
                      {ocrParseMutation.isPending ? "Reading image..." : "Parse Screenshot"}
                    </Button>
                  </div>
                </div>

                {/* Manual Clipboard Section */}
                <div className="glass-effect rounded-2xl p-6 mb-8 border border-blue-200">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                      <Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Outfit']">Quick Text Parser</h3>
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
                    className="mb-4 h-32 resize-none rounded-xl"
                  />
                  <div className="flex">
                    <Button
                      type="button"
                      onClick={() => parseClipboardMutation.mutate(clipboardText)}
                      disabled={!clipboardText || parseClipboardMutation.isPending}
                      className="luxury-button w-full"
                    >
                      {parseClipboardMutation.isPending ? "Parsing..." : "Parse Text Above"}
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Property Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main Street, City, State" className="rounded-xl p-4 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-800">Listing Price</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="$750,000" className="rounded-xl p-4 text-lg" />
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
                        <FormLabel className="text-lg font-semibold text-gray-800">Zestimate</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="$780,000" className="rounded-xl p-4 text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-800">Monthly Payment</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2602" className="rounded-xl p-4 text-lg" />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-600">
                          Estimated monthly payment amount (numbers only)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Image Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-800">Property Image</Label>
                  
                  {form.watch("imageData") ? (
                    <div className="relative p-6 border-2 border-gray-300 rounded-xl">
                      <img 
                        src={form.watch("imageData")} 
                        alt="Property" 
                        className="w-full max-w-md h-48 object-cover rounded-xl border mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => form.setValue("imageData", "")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      tabIndex={0}
                      onPaste={(e) => {
                        e.preventDefault();
                        const items = e.clipboardData?.items;
                        if (!items) return;
                        
                        for (let i = 0; i < items.length; i++) {
                          const item = items[i];
                          if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                form.setValue("imageData", event.target?.result as string);
                                toast({ title: "Image pasted successfully!" });
                              };
                              reader.readAsDataURL(file);
                              return;
                            }
                          }
                        }
                        toast({
                          title: "No image found",
                          description: "Please copy an image first",
                          variant: "destructive",
                        });
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer?.files;
                        if (!files || files.length === 0) return;
                        
                        const file = files[0];
                        if (file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            form.setValue("imageData", event.target?.result as string);
                            toast({ title: "Image uploaded successfully!" });
                          };
                          reader.readAsDataURL(file);
                        } else {
                          toast({
                            title: "Invalid file type",
                            description: "Please upload an image file",
                            variant: "destructive",
                          });
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <p className="text-gray-600 mb-4">
                        Click here and paste an image (Ctrl+V or Cmd+V) or drag & drop
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl px-6 py-3"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard && navigator.clipboard.read) {
                              const clipboardItems = await navigator.clipboard.read();
                              for (const clipboardItem of clipboardItems) {
                                for (const type of clipboardItem.types) {
                                  if (type.startsWith('image/')) {
                                    const blob = await clipboardItem.getType(type);
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      form.setValue("imageData", e.target?.result as string);
                                      toast({ title: "Image pasted successfully!" });
                                    };
                                    reader.readAsDataURL(blob);
                                    return;
                                  }
                                }
                              }
                              toast({
                                title: "No image found",
                                description: "Please copy an image first",
                                variant: "destructive",
                              });
                            } else {
                              // For browsers without clipboard API support
                              toast({
                                title: "Use keyboard paste",
                                description: "Click in this area and press Ctrl+V (or Cmd+V on Mac)",
                                variant: "default",
                              });
                            }
                          } catch (error) {
                            // Fallback for when clipboard access is denied
                            toast({
                              title: "Use keyboard paste",
                              description: "Click in this area and press Ctrl+V (or Cmd+V on Mac)",
                              variant: "default",
                            });
                          }
                        }}
                      >
                        Paste Image
                      </Button>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="listingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Listing URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.zillow.com/homedetails/..." className="rounded-xl p-4 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-800">Open House Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="rounded-xl p-4 text-lg" />
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
                        <FormLabel className="text-lg font-semibold text-gray-800">Open House Time</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2:00 PM - 4:00 PM" className="rounded-xl p-4 text-lg" />
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
                      <FormLabel className="text-lg font-semibold text-gray-800">Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Add any notes about this property..." className="rounded-xl p-4 text-lg min-h-[120px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="luxury-button w-full py-4 text-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : (editingOpenHouse ? "Update Property" : "Save Property")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}