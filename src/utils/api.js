export async function fetchMessagesFromVercel() {
  try {
    const response = await fetch(
      "https://whatsapp-webhook-vercel-two.vercel.app/api/webhook?logs=true"
    );
    const data = await response.json();

    if (data.messages && data.messages.length > 0) {
      // Simpan ke localStorage
      const existing = JSON.parse(
        localStorage.getItem("whatsapp-messages") || "[]"
      );

      // Merge dan hilangkan duplikat
      const merged = [
        ...existing,
        ...data.messages.filter((m) => !existing.find((e) => e.id === m.id)),
      ];

      localStorage.setItem("whatsapp-messages", JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.error("Error fetching from Vercel:", error);
  }
  return null;
}
