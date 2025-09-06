import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonialsDemo() {
    const testimonials = [
        {
          quote:
            "WrenchEX made it so easy to find genuine spare parts for my hybrid car. The process was smooth, and I got everything delivered on time.",
          name: "Ahmed Khan",
          designation: "Customer – Toyota Prius Owner",
          src: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=3540&auto=format&fit=crop",
        },
        {
          quote:
            "Listing my workshop on WrenchEX has boosted my business. The seller dashboard is simple to use, and I now get regular bookings online.",
          name: "Sara Malik",
          designation: "Auto Workshop Owner – Malik Motors",
          src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=3540&auto=format&fit=crop",
        },
        {
          quote:
            "The appointment booking feature is a game-changer. My customers can book services online, and I manage everything in one place.",
          name: "Bilal Hussain",
          designation: "Service Provider – Hybrid Specialist",
          src: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=3540&auto=format&fit=crop",
        },
        {
          quote:
            "I was worried about finding the right parts, but WrenchEX connected me with trusted sellers at great prices. Highly recommended!",
          name: "Fatima Ali",
          designation: "Customer – Honda Civic Owner",
          src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3464&auto=format&fit=crop",
        },
        {
          quote:
            "WrenchEX has given small workshops like ours a digital presence. We’re reaching more customers and building long-term trust.",
          name: "Usman Sheikh",
          designation: "Service Provider – AutoTech Garage",
          src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop",
        },
      ];
      
  return <AnimatedTestimonials testimonials={testimonials} />;
}
