
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tables } from "@/integrations/supabase/types";
import { validateDates } from "@/utils/dateUtils";
import { validatePrizeForm } from "@/utils/prizeValidation";
import DateSelects from "./prize-form/DateSelects";
import ImageUpload from "./prize-form/ImageUpload";

type Prize = Tables<"prizes">

interface PrizeFormProps {
  onPrizeAdded: () => void;
}

const PrizeForm = ({ onPrizeAdded }: PrizeFormProps) => {
  const [loading, setLoading] = useState(false);
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
    
    const error = validateDates(type, dateField, newPrize);
    if (error) {
      toast.error(error);
      return;
    }

    setNewPrize({ ...newPrize, [type]: dateField.toISOString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors([]);
    const errors = validatePrizeForm(newPrize);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
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

  return (
    <Card className="p-6 bg-muted/50">
      <h2 className="text-2xl font-semibold mb-2">Add New Prize</h2>
      <p className="text-muted-foreground mb-6">Create a new prize for users to compete for</p>

      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6 border-red-500 bg-red-50">
          <AlertDescription>
            <ul className="list-disc pl-4 text-red-600">
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

        <DateSelects
          fieldName="registration_start"
          label="Registration Start"
          value={newPrize.registration_start}
          onDateChange={handleDateChange}
        />
        
        <DateSelects
          fieldName="registration_end"
          label="Registration End"
          value={newPrize.registration_end}
          onDateChange={handleDateChange}
        />
        
        <DateSelects
          fieldName="deadline"
          label="Competition End Date"
          value={newPrize.deadline}
          onDateChange={handleDateChange}
        />

        <ImageUpload
          imageUrl={newPrize.image_url}
          onImageUploaded={(url) => setNewPrize(prev => ({ ...prev, image_url: url }))}
        />

        <div className="mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Prize"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PrizeForm;
