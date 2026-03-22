import { ArrowLeft, Github, Linkedin, Mail, ExternalLink, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";

const links = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/javen-lai/",
    description: "Connect professionally and stay in touch.",
    icon: Linkedin,
  },
  {
    name: "GitHub Project",
    href: "https://github.com/Javen05/bonding_games",
    description: "View source code and project updates.",
    icon: Github,
  },
  {
    name: "Email",
    href: "mailto:javenlai5@gmail.com",
    description: "Send feedback, ideas, or collab requests.",
    icon: Mail,
  },
  {
    name: "Buy Me a Coffee",
    href: "https://buymeacoffee.com/javenlai",
    description: "Support my passion and endeavors financially.",
    icon: Coffee,
  },
];

const Socials = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Socials</h1>
      </div>

      <main className="flex-1 px-6 pb-12 max-w-lg mx-auto w-full">
        <div className="text-center mb-8 mt-4">
          <p className="text-muted-foreground text-sm">
            Find me online and reach out.
          </p>
        </div>

        <div className="grid gap-4">
          {links.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target={item.href.startsWith("mailto:") ? "_self" : "_blank"}
                rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group rounded-2xl bg-card border border-border p-5 hover:border-primary/40 transition-all"
                style={{
                  animationDelay: `${index * 70}ms`,
                  animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  opacity: 0,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </a>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center font-mono">
          Copyright &copy; 2026 Javen Lai. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default Socials;
