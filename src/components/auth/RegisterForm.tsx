import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import PersonalInfoFields from "./PersonalInfoFields";
import ContactInfoFields from "./ContactInfoFields";
import AccountInfoFields from "./AccountInfoFields";

const RegisterForm = () => {
  const { form, isLoading, onSubmit } = useRegisterForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PersonalInfoFields control={form.control} />
        <ContactInfoFields control={form.control} />
        <AccountInfoFields control={form.control} />

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;