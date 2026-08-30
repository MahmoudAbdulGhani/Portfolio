import { CrudList } from "../../components/admin/CrudList";
import type { CrudColumn } from "../../components/admin/CrudList";
import {
  useAdminSkills,
  useCreateSkill,
  useDeleteSkill,
  useUpdateSkill,
} from "../../lib/hooks";
import type { Skill } from "../../types";

const columns: CrudColumn<Skill>[] = [
  { key: "name", label: "Skill" },
  { key: "category", label: "Category" },
  { key: "status", label: "Evidence status" },
  { key: "order", label: "Order" },
];

export function Skills() {
  const { data, isLoading, error, isFetching, refetch } = useAdminSkills();
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const remove = useDeleteSkill();
  const categories = [...new Set((data ?? []).map((skill) => skill.category))].sort();

  return (
    <CrudList
      title="Skills"
      subtitle="Manage capability categories and evidence status. Only verified skills are eligible for the application CV."
      columns={columns}
      fields={[
        { key: "name", label: "Name", placeholder: "e.g. REST APIs", required: true },
        { key: "category", label: "Category", placeholder: "Choose an existing category or type a new one", required: true, suggestions: categories },
        { key: "status", label: "Evidence status", required: true, options: [
          { value: "verified", label: "Used in projects / professional work" },
          { value: "familiar", label: "Familiar with" },
          { value: "learning", label: "Currently learning" },
        ] },
        { key: "order", label: "Display order", placeholder: "0" },
      ]}
      items={data}
      isLoading={isLoading}
      queryError={error}
      isRetrying={isFetching}
      onRetry={() => void refetch()}
      emptyText="No skills yet."
      onCreate={(input) => create.mutateAsync(input as Omit<Skill, "id">)}
      onUpdate={(id, input) => update.mutateAsync({ id, input: input as Partial<Skill> })}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}
