// components/Navbar.js
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // In this example, we store user info in localStorage after login.
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = async () => {
    await axios.post("/api/logout");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-bold">My App</a>
        </Link>
        <div className="flex space-x-4">
          {user && (user.role === "admin" || user.role === "editor") && (
            <Link href="/import_excel">
              <a className="hover:underline">Import Excel</a>
            </Link>
          )}
          {user && user.role === "admin" && (
            <Link href="/admin_tasks">
              <a className="hover:underline">Admin Tasks</a>
            </Link>
          )}
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
