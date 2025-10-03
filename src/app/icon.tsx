import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "22%",
          boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.08) inset",
        }}
      >
        <svg
          width="32"
          height="28"
          viewBox="0 0 19 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.5684 7.07577C10.874 3.56178 11.091 2.56262 17.837 0.899874C17.837 2.94267 16.8966 8.18833 10.5684 7.07577C10.1476 7.14542 8.49879 7.70482 9.47576 9.59364C5.51371 12.0526 2.271 9.18121 1.21101 7.70482C5.9098 5.29518 8.72275 8.13781 9.47576 9.59364C8.49879 7.70482 10.1476 7.14542 10.5684 7.07577Z"
            fill="#4ade80"
          />
          <path
            d="M10.5684 7.07577C10.874 3.56178 11.091 2.56262 17.837 0.899874C17.837 2.94267 16.8966 8.18833 10.5684 7.07577ZM10.5684 7.07577C10.1476 7.14542 8.49879 7.70482 9.47576 9.59364M9.47576 9.59364C8.72275 8.13781 5.9098 5.29518 1.21101 7.70482C2.271 9.18121 5.51371 12.0526 9.47576 9.59364ZM9.47576 9.59364C10.7109 11.5889 10.4279 13.5857 8.62064 15.1519"
            stroke="#22c55e"
            strokeWidth="1.35"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
