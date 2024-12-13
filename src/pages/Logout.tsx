import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div>
      <h2>You have been logged out...</h2>
    </div>
  );
}
