import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithAuth(props: P) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push("/");
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
