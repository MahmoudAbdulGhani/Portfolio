import { CrudList } from "../../components/admin/CrudList";
import type { CrudColumn } from "../../components/admin/CrudList";
import {
  useAdminEducation,
  useCreateEducation,
  useDeleteEducation,
  useUpdateEducation,
} from "../../lib/hooks";
import type { Education } from "../../types";

const columns: CrudColumn<Education>[] = [
  { key: "school", label: "School" },
  { key: "degree", label: "Degree" },
  { key: "field", label: "Field" },
  { key: "period", label: "Period" },
];

export function Education() {
  const { data, isLoading, error, isFetching, refetch } = useAdminEducation();
  const create = useCreateEducation();
  const update = useUpdateEducation();
  const remove = useDeleteEducation();

  return (
    <CrudList
      title="Education"
      subtitle="Academic background shown on the public site's education section and the generated CV."
      columns={columns}
      fields={[
        { key: "school", label: "School / university", required: true },
        { key: "degree", label: "Degree", required: true },
        { key: "field", label: "Field of study" },
        { key: "period", label: "Period", placeholder: "e.g. 2020 — 2023" },
        { key: "details", label: "Details" },
        { key: "order", label: "Display order", placeholder: "0" },
      ]}
      items={data}
      isLoading={isLoading}
      queryError={error}
      isRetrying={isFetching}
      onRetry={() => void refetch()}
      emptyText="No education entries yet."
      onCreate={(input) => create.mutateAsync(input as Omit<Education, "id">)}
      onUpdate={(id, input) =>
        update.mutateAsync({ id, input: input as Partial<Education> })
      }
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
