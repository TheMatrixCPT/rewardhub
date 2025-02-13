
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto py-6 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-32">
            <AspectRatio ratio={3/1}>
              <img
                src="/lovable-uploads/ce999b77-15b2-4755-8545-d37bf1c43e70.png"
                alt="DIGI NEXT"
                className="object-contain w-full h-full dark:invert"
              />
            </AspectRatio>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              Powered by DIGI NEXT
            </p>
            <p className="text-sm text-muted-foreground">
              © {currentYear} RewardHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
