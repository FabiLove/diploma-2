import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Sidebar/>
      <DropdownMenu />
    </div>
  );
}