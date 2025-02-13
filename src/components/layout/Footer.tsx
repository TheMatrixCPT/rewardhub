
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-1 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center gap-6">
          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground">
              Powered by
            </p>
            <div className="w-52">
              <AspectRatio ratio={3/1}>
                <img
                  src="/lovable-uploads/7d8293fe-494e-44ac-996c-b74a26e03b81.png"
                  alt="DIGI NEXT"
                  className="object-contain w-full h-full dark:invert"
                />
              </AspectRatio>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            COPYRIGHT © {currentYear} RewardHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
