import "next-auth";

declare module "next-auth" {
  interface User {
    playerCode?: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      playerCode: string;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    playerCode: string;
    isAdmin: boolean;
  }
}
