/** @type {import('tailwindcss').Config} */
export default {
  // scans both the src folder and the root app.tsx for Tailwind classes
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
