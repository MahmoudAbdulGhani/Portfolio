import { FiExternalLink } from "react-icons/fi";
import { CrudList } from "../../components/admin/CrudList";
import type { CrudColumn } from "../../components/admin/CrudList";
import {
  useAdminCertifications,
  useCreateCertification,
  useDeleteCertification,
  useUpdateCertification,
} from "../../lib/hooks";
import type { Certification } from "../../types";

const columns: CrudColumn<Certification>[] = [
  { key: "title", label: "Certification" },
  { key: "issuer", label: "Issuer" },
  { key: "year", label: "Year / period" },
  {
    key: "url",
    label: "Link",
    render: (cert) =>
      cert.url ? (
        <a
          href={cert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          View
          <FiExternalLink size={12} />
        </a>
      ) : (
        "—"
      ),
  },
];

export function Certifications() {
  const { data, isLoading, error, isFetching, refetch } = useAdminCertifications();
  const create = useCreateCertification();
  const update = useUpdateCertification();
  const remove = useDeleteCertification();

  return (
    <CrudList
      title="Certifications"
      subtitle="Certificates and credentials shown on the public site's certifications section and the generated CV."
      columns={columns}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "issuer", label: "Issuer", required: true },
        { key: "year", label: "Year / period" },
        { key: "url", label: "Credential URL", placeholder: "https://…" },
        { key: "order", label: "Display order", placeholder: "0" },
      ]}
      items={data}
      isLoading={isLoading}
      queryError={error}
      isRetrying={isFetching}
      onRetry={() => void refetch()}
      emptyText="No certifications yet."
      onCreate={(input) => create.mutateAsync(input as Omit<Certification, "id">)}
      onUpdate={(id, input) =>
        update.mutateAsync({ id, input: input as Partial<Certification> })
      }
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
