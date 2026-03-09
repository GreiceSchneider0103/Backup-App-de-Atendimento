"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <section className="card" style={{ margin: 24 }}>
          <h1>Erro inesperado</h1>
          <p>{error.message}</p>
          <button onClick={() => reset()}>Tentar novamente</button>
        </section>
      </body>
    </html>
  );
}
