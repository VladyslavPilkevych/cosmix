import { Button } from "@ui/primitives/Button";
import { hello } from "@sdk/index";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Web3 Subscriptions — Web App</h1>
      <p>SDK says: {hello()}</p>
      <Button>Click</Button>
    </main>
  );
}
