
import { ArrowRight, Award, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Index = () => {
  const features = [
    {
      title: "Track Your Progress",
      description: "Monitor your achievements and growth through our point system",
      icon: Award,
    },
    {
      title: "Connect & Network",
      description: "Engage with peers and build valuable professional relationships",
      icon: Users,
    },
    {
      title: "Earn Rewards",
      description: "Get recognized for your accomplishments with badges and prizes",
      icon: Trophy,
    },
    {
      title: "Motivates Self-Education",
      description: "Empowers users to take control of their learning journey through engaging rewards and incentives",
      icon: Award,
    },
    {
      title: "Skill Development",
      description: "Provides structured pathways and opportunities for continuous professional growth",
      icon: Users,
    },
    {
      title: "Achievement Recognition",
      description: "Celebrates your accomplishments with meaningful rewards and community acknowledgment",
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to{" "}
              <span className="text-primary">RewardHub</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Track your progress, earn rewards, and compete with others in a
              gamified learning experience.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="group rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-all duration-200 flex items-center gap-2"
              >
                Sign In
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>
              <Link
                to="/register"
                className="rounded-full px-6 py-3 text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem key={index} className="md:basis-1/3">
                  <Card className="p-6 h-full">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>
    </div>
  );
};

export default Index;
