export const metadata = { title: "Cosmix — In Development" };

export default function MarketingPage() {
  return (
    <main style={{ padding: "4rem 1rem", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>{"Cosmix"}</h1>
      <p style={{ opacity: 0.8 }}>
        {`Open-source cross-chain dashboard. ${<strong>{"Work in progress."}</strong>}`}
      </p>
    </main>
  );
}
