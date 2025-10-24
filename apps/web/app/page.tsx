import { redirect } from "next/navigation";

export default function Page() {
  //   const loggedIn = isConnected(); // todo: implement
  const loggedIn = true;

  if (loggedIn) redirect("/dashboard");
  else redirect("/landing");
}
