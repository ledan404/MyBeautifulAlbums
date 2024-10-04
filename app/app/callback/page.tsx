"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "../../api/auth";

const SpotifyCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("No code provided in URL");
        }
        router.prefetch("/profile");
        await getToken(code);
        router.push("/profile");
        window.location.reload();
        router.push("/profile");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching token:", err.message);
          router.push("/profile");
        } else {
          setError("An unknown error occurred");
          console.error("Error fetching token:", err);
        }
      }
    };

    fetchToken();
  }, [router]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Processing Spotify callback...</div>;
};

export default SpotifyCallback;
