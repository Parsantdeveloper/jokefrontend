
import {redirect} from "next/navigation";
import {cookies} from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
    headers: { cookie: `accessToken=${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const { data } = await res.json();
  return data;
}

export default async function AdminLayout({children}:{children:React.ReactNode}){
   
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }
    if (session.role !== "ADMIN") {
      redirect("/unauthorized");
    }

    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        {children}
      </div>
    );

}