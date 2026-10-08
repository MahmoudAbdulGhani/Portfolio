import { useParams } from "react-router-dom";
import { ProjectReader } from "../components/landscape/ProjectReader";

export function ProjectDetail() {
  const { slug } = useParams();
  return <ProjectReader key={slug} />;
}
