export function formatDate(value?: string): string {
  return value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";
}

export function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return (
    Array.from(
      { length: 10 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("") + "@"
  );
}

export function emptyUserForm() {
  return {
    name: "",
    email: "",
    phone: "",
    username: "",
    password: generatePassword(),
  };
}
