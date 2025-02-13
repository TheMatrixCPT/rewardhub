
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background absolute bottom-0 left-0 right-0">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center">
          <p className="text-sm text-muted-foreground">
            COPYRIGHT © {currentYear} RewardHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
