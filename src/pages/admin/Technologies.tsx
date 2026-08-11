import { CrudList } from "../../components/admin/CrudList";
import type { CrudColumn } from "../../components/admin/CrudList";
import {
  useAdminTechnologies,
  useCreateTechnology,
  useDeleteTechnology,
  useUpdateTechnology,
} from "../../lib/hooks";
import type { Technology } from "../../types";

const categoryOptions: { value: string; label: string }[] = [
  { value: "languages", label: "Languages" },
  { value: "frameworks", label: "Frameworks" },
  { value: "databases", label: "Data layers" },
  { value: "ops", label: "Tools & platforms" },
];

const columns: CrudColumn<Technology>[] = [
  { key: "name", label: "Technology" },
  { key: "category", label: "Category" },
  { key: "order", label: "Order" },
];

export function Technologies() {
  const { data, isLoading, error, isFetching, refetch } = useAdminTechnologies();
  const create = useCreateTechnology();
  const update = useUpdateTechnology();
  const remove = useDeleteTechnology();

  return (
    <CrudList
      title="Technologies"
      subtitle="Languages, frameworks, databases and tools shown in the Technologies section."
      columns={columns}
      fields={[
        { key: "name", label: "Name", placeholder: "e.g. React.js", required: true },
        { key: "category", label: "Category", options: categoryOptions, required: true },
        { key: "order", label: "Display order", placeholder: "0" },
      ]}
      items={data}
      isLoading={isLoading}
      queryError={error}
      isRetrying={isFetching}
      onRetry={() => void refetch()}
      emptyText="No technologies yet."
      onCreate={(input) => create.mutateAsync(input as Omit<Technology, "id">)}
      onUpdate={(id, input) =>
        update.mutateAsync({ id, input: input as Partial<Technology> })
      }
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
