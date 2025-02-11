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
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tables } from "@/integrations/supabase/types";

type Prize = Tables<"prizes">

interface PrizeFormProps {
  onPrizeAdded: () => void;
}

const PrizeForm = ({ onPrizeAdded }: PrizeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
    
    // Validate dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (dateField < now) {
      toast.error("Cannot select a date before today");
      return;
    }

    // Check registration end date is after start date
    if (type === 'registration_end' && newPrize.registration_start) {
      const startDate = new Date(newPrize.registration_start);
      if (dateField <= startDate) {
        toast.error("Registration end date must be after registration start date");
        return;
      }
    }

    // Check deadline is after registration end date
    if (type === 'deadline' && newPrize.registration_end) {
      const endDate = new Date(newPrize.registration_end);
      if (dateField <= endDate) {
        toast.error("Competition end date must be after registration end date");
        return;
      }
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

  const validateForm = () => {
    const errors: string[] = [];

    // Check required fields
    if (!newPrize.name) {
      errors.push("Prize name is required");
    }
    if (!newPrize.points_required) {
      errors.push("Points required is required");
    }
    if (!newPrize.registration_start) {
      errors.push("Registration start date is required");
    }
    if (!newPrize.registration_end) {
      errors.push("Registration end date is required");
    }
    if (!newPrize.deadline) {
      errors.push("Competition end date is required");
    }

    // Validate dates if they exist
    if (newPrize.registration_start && newPrize.registration_end && newPrize.deadline) {
      const regStart = new Date(newPrize.registration_start);
      const regEnd = new Date(newPrize.registration_end);
      const deadline = new Date(newPrize.deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (regStart < now) {
        errors.push("Registration start date must be in the future");
      }
      if (regStart >= regEnd) {
        errors.push("Registration end date must be after registration start date");
      }
      if (regEnd >= deadline) {
        errors.push("Competition end date must be after registration end date");
      }
    }

    // Points validation
    if (newPrize.points_required) {
      const points = parseInt(newPrize.points_required);
      if (isNaN(points) || points <= 0) {
        errors.push("Points required must be a positive number");
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors([]);

    // Validate the form
    if (!validateForm()) {
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
      setValidationErrors([]);
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
            <SelectTrigger className="w-24">
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
            <SelectTrigger className="w-24">
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
            <SelectTrigger className="w-24">
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

      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prize Name *</label>
          <Input
            required
            value={newPrize.name}
            onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
            placeholder="Enter prize name"
            className={cn(
              validationErrors.includes("Prize name is required") && "border-red-500"
            )}
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
            className={cn(
              validationErrors.some(error => error.includes("Points required")) && "border-red-500"
            )}
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
