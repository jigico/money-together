import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F5F5F7",
                foreground: "#1d1d1f",
                card: "#FFFFFF",
                primary: {
                    DEFAULT: "#0047AB",
                    foreground: "#FFFFFF",
                },
                deepBlue: {
                    DEFAULT: "#0047AB",
                    50: "#E6F0FF",
                    100: "#CCE0FF",
                    200: "#99C2FF",
                    300: "#66A3FF",
                    400: "#3385FF",
                    500: "#0047AB",
                    600: "#003D94",
                    700: "#00337D",
                    800: "#002966",
                    900: "#001F4F",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
