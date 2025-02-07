import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Prize = Tables<"prizes">

interface PrizeFormProps {
  onPrizeAdded: () => void;
}

const PrizeForm = ({ onPrizeAdded }: PrizeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: "",
    description: "",
    points_required: "",
    image_url: "",
    deadline: "",
    registration_start: "",
    registration_end: "",
  });

  // Date handling functions
  const handleDateChange = (type: 'registration_start' | 'registration_end' | 'deadline', field: 'year' | 'month' | 'day', value: string) => {
    const dateField = newPrize[type] ? new Date(newPrize[type]) : new Date();
    
    switch (field) {
      case 'year':
        dateField.setFullYear(parseInt(value));
        break;
      case 'month':
        dateField.setMonth(parseInt(value));
        break;
      case 'day':
        dateField.setDate(parseInt(value));
        break;
    }
    
    setNewPrize({ ...newPrize, [type]: dateField.toISOString() });
  };

  const getDateParts = (dateString: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate()
    };
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2000, i, 1), 'MMMM')
  }));
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `prizes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      setNewPrize(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const validateDates = () => {
    const regStart = new Date(newPrize.registration_start);
    const regEnd = new Date(newPrize.registration_end);
    const deadline = new Date(newPrize.deadline);
    const now = new Date();

    // Check if dates are valid
    if (isNaN(regStart.getTime()) || isNaN(regEnd.getTime()) || isNaN(deadline.getTime())) {
      toast.error("Please enter valid dates");
      return false;
    }

    // Check if registration start is before registration end
    if (regStart >= regEnd) {
      toast.error("Registration start date must be before registration end date");
      return false;
    }

    // Check if registration end is before competition end
    if (regEnd >= deadline) {
      toast.error("Registration end date must be before competition end date");
      return false;
    }

    // Check if all dates are in the future
    if (regStart < now) {
      toast.error("Registration start date must be in the future");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newPrize.name || !newPrize.points_required || !newPrize.registration_start || 
        !newPrize.registration_end || !newPrize.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate dates
    if (!validateDates()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('prizes')
        .insert([
          {
            ...newPrize,
            points_required: parseInt(newPrize.points_required),
            deadline: newPrize.deadline ? new Date(newPrize.deadline).toISOString() : null,
            registration_start: newPrize.registration_start ? new Date(newPrize.registration_start).toISOString() : null,
            registration_end: newPrize.registration_end ? new Date(newPrize.registration_end).toISOString() : null,
          },
        ]);

      if (error) throw error;

      toast.success("Prize added successfully!");
      setNewPrize({
        name: "",
        description: "",
        points_required: "",
        image_url: "",
        deadline: "",
        registration_start: "",
        registration_end: "",
      });
      onPrizeAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDateSelects = (fieldName: 'registration_start' | 'registration_end' | 'deadline', label: string) => {
    const date = newPrize[fieldName] ? new Date(newPrize[fieldName]) : new Date();
    const daysInMonth = getDaysInMonth(date);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dateParts = getDateParts(newPrize[fieldName]);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-2">{label} *</label>
        <div className="grid grid-cols-3 gap-2">
          <Select
            value={dateParts.year.toString()}
            onValueChange={(value) => handleDateChange(fieldName, 'year', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={dateParts.month.toString()}
            onValueChange={(value) => handleDateChange(fieldName, 'month', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={dateParts.day.toString()}
            onValueChange={(value) => handleDateChange(fieldName, 'day', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-muted/50">
      <h2 className="text-2xl font-semibold mb-2">Add New Prize</h2>
      <p className="text-muted-foreground mb-6">Create a new prize for users to compete for</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prize Name *</label>
          <Input
            required
            value={newPrize.name}
            onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
            placeholder="Enter prize name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={newPrize.description}
            onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
            placeholder="Describe the prize"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Points Required *</label>
          <Input
            required
            type="number"
            value={newPrize.points_required}
            onChange={(e) => setNewPrize({ ...newPrize, points_required: e.target.value })}
            placeholder="Enter required points"
          />
        </div>

        {renderDateSelects('registration_start', 'Registration Start')}
        {renderDateSelects('registration_end', 'Registration End')}
        {renderDateSelects('deadline', 'Competition End Date')}

        <div>
          <label className="block text-sm font-medium mb-2">Prize Image</label>
          <div className="flex gap-4 items-start">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="flex-1"
            />
            {newPrize.image_url && (
              <img
                src={newPrize.image_url}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading || uploadingImage} className="w-full">
            {loading ? "Adding..." : "Add Prize"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PrizeForm;
