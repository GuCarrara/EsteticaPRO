import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "EstéticaPro | Sistema para Estéticas Automotivas",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <ClientLayout session={session}>
      {children}
    </ClientLayout>
  );
}
