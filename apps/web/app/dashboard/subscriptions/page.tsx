
"use client";

import { Button, Card } from "@chakra-ui/react";


export const metadata = { title: "Subscriptions — Cosmix" };

const PLANS = [
  { id: "free", name: "Free", price: "$0", features: ["Basics"] },
  { id: "pro", name: "Pro", price: "$9/mo", features: ["Portfolio alerts", "Extended history"] },
];

export default function SubscriptionsPage() {
  return (
    <>
      <h1 className="text-2xl mb-4">{"Subscriptions"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <Card key={p.id} title={`${p.name} — ${p.price}`}>
            <ul className="list-disc pl-5 mb-4">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Button onClick={() => alert(`Select ${p.name}`)}>{"Choose"}</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
