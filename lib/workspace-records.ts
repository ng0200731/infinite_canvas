import { z } from "zod";

export const supplierProductTypes = [
  "woven-label",
  "wash-care-label",
  "hang-tag",
  "heat-transfer",
  "elastic",
  "drawcord",
  "metal",
  "button",
  "pu-patch",
  "embroidery-patch",
  "silicon-patch",
  "thread",
  "polybag",
] as const;

export type SupplierProductType = (typeof supplierProductTypes)[number];

export const defaultSupplierProductType = "woven-label" satisfies SupplierProductType;

export const supplierProductTypeLabels: Record<SupplierProductType, string> = {
  "woven-label": "Woven label",
  "wash-care-label": "Wash care label",
  "hang-tag": "Hang tag",
  "heat-transfer": "Heat transfer",
  elastic: "Elastic",
  drawcord: "Drawcord",
  metal: "Metal",
  button: "Button",
  "pu-patch": "PU patch",
  "embroidery-patch": "Embroidery patch",
  "silicon-patch": "Silicon patch",
  thread: "Thread",
  polybag: "Polybag",
};

const legacySupplierProductTypeMap: Record<string, SupplierProductType> = {
  label: "woven-label",
  tag: "hang-tag",
  zipper: "metal",
  snap: "button",
};

export function normalizeSupplierProductTypes(values: readonly string[]): SupplierProductType[] {
  const normalized = values
    .map((value) =>
      supplierProductTypes.includes(value as SupplierProductType)
        ? (value as SupplierProductType)
        : legacySupplierProductTypeMap[value],
    )
    .filter((value): value is SupplierProductType => Boolean(value));

  return Array.from(new Set(normalized));
}

export function normalizeSupplierProductType(value: string | null | undefined): SupplierProductType {
  return normalizeSupplierProductTypes(value ? [value] : [])[0] ?? defaultSupplierProductType;
}

export function getProductPriceUnit(productType: SupplierProductType): string {
  if (productType === "elastic" || productType === "drawcord") return "per meter";
  if (productType === "thread") return "per cone";
  if (productType === "polybag") return "per bag";
  return "per pc";
}

export function normalizeProductParameters(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, parameterValue]) => [key, parameterValue]),
  );
}

const domainSuffixSchema = z
  .string()
  .trim()
  .min(1, "Email domain suffix is required.")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i, {
    message: "Use a domain like example.com.",
  });

export const customerCompanySchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required."),
  emailDomainSuffix: domainSuffixSchema,
  type: z.string().trim().min(1, "Customer type is required."),
});

export const supplierCompanySchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required."),
  emailDomainSuffix: domainSuffixSchema,
  productTypes: z.array(z.enum(supplierProductTypes)).min(1, "Choose at least one product type."),
});

export const employeeSchema = z.object({
  userName: z.string().trim().min(1, "User name is required."),
  emailPrefix: z.string().trim().min(1, "Email prefix is required."),
  title: z.string().trim().min(1, "Title is required."),
  tel: z.string().trim().min(1, "Telephone is required."),
});

export const productImageSchema = z.object({
  name: z.string().trim().min(1, "Image name is required."),
  url: z.string().trim().min(1, "Image URL is required."),
  storagePath: z.string().nullable(),
});

export const productSchema = z.object({
  productType: z.enum(supplierProductTypes),
  subject: z.string().trim().min(1, "Subject is required."),
  detail: z.string().trim().min(1, "Product detail is required."),
  material: z.string().trim().min(1, "Material is required."),
  colorNotes: z.string().trim().min(1, "Color notes are required."),
  parameters: z.record(z.string(), z.string()),
  unitPrice: z.string().trim().min(1, "Unit price is required."),
  priceUnit: z.string().trim().min(1, "Price unit is required."),
  image: productImageSchema.nullable(),
});

export type CustomerCompanyInput = z.infer<typeof customerCompanySchema>;
export type SupplierCompanyInput = z.infer<typeof supplierCompanySchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductInput = z.infer<typeof productSchema>;

export interface EmployeeRecord extends EmployeeInput {
  id: string;
}

export interface CustomerRecord {
  id: string;
  company: CustomerCompanyInput;
  employees: EmployeeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRecord {
  id: string;
  company: SupplierCompanyInput;
  employees: EmployeeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord extends ProductInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const customerRecordInputSchema = z.object({
  company: customerCompanySchema,
  employees: z.array(employeeSchema.extend({ id: z.string().min(1) })).min(1),
});

export const supplierRecordInputSchema = z.object({
  company: supplierCompanySchema,
  employees: z.array(employeeSchema.extend({ id: z.string().min(1) })).min(1),
});

export const productRecordInputSchema = productSchema;

export type CustomerRecordInput = z.infer<typeof customerRecordInputSchema>;
export type SupplierRecordInput = z.infer<typeof supplierRecordInputSchema>;
export type ProductRecordInput = z.infer<typeof productRecordInputSchema>;

export function normalizeEmailDomainSuffix(value: string) {
  return value.trim().replaceAll("@", "").replace(/\s+/g, "").toLowerCase();
}

export function hadAtSymbol(value: string) {
  return value.includes("@");
}
