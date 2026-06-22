import ChatWindow from "@/components/ChatWindow";
import ProjectIntro from "@/components/ProjectIntro";

export default function Home() {
  return (
    <div className="lg:flex">
      <ProjectIntro />
      <ChatWindow />
    </div>
  );
}
