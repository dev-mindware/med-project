import { Icon } from "@/components";
import { UserRole } from "@/types";

type SubMenuItem = {
  name: string;
  url: string;
  roles?: UserRole[];
};

export type MenuItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
  items?: SubMenuItem[];
};

export type MenuStructure = {
  items: MenuItem[];
};

export const menuItems: MenuStructure = {
  items: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
    },
    {
      name: "VONALP",
      url: "#",
      icon: <Icon name="BookOpen" className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
      items: [
        { name: "Extrair de PDF", url: "/vonalp/extract" },
        { name: "Entradas", url: "/vonalp/entries" },
        { name: "Neologismos", url: "/vonalp/neologisms" },
        { name: "Topónimos", url: "/vonalp/toponyms" },
        { name: "Antropónimos", url: "/vonalp/anthroponyms" },
        { name: "Estrangeirismos", url: "/vonalp/foreignisms" },
      ]
    },
    {
      name: "VOLNA",
      url: "/volna",
      icon: <Icon name="Languages" className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
    },
    {
      name: "Gestão de Conteúdos",
      url: "#",
      icon: <Icon name="UsersRound" className="w-5 h-5" />,
      roles: ["ADMIN"],
      items: [
        { name: "Blog", url: "/content-management/blog-posts" },
        { name: "Eventos", url: "/content-management/events" },
      ]
    },
    {
      name: "Administração",
      url: "#",
      icon: <Icon name="BrickWallShield" className="w-5 h-5" />,
      roles: ["ADMIN"],
      items: [
        { name: "Utilizadores", url: "/administration/users" },
        { name: "Logs de Auditoria", url: "/administration/audit-logs" },
        { name: "Relatórios", url: "/administration/reports" },
      ]
    },
    {
      name: "Definições",
      url: "/settings",
      icon: <Icon name="Settings" className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
    },
    {
      name: "Ajuda",
      url: "/help",
      icon: <Icon name="BadgeQuestionMark" className="w-5 h-5" />,
      roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
    },
  ],
};
