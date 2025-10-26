"use client";

export default function HeaderToggle() {
  const handleToggle = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebar:toggle'));
    }
  };

  return (
    <button
      aria-label="Open menu"
      onClick={handleToggle}
      className="header-toggle p-2 rounded bg-[rgba(255,255,255,0.04)]"
    >
      ☰
    </button>
  );
}
