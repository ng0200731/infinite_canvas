import { beforeEach, describe, expect, it } from "vitest";

import { localWorkspaceRecordStore } from "./localWorkspaceRecordStore";

beforeEach(() => localStorage.clear());

describe("localWorkspaceRecordStore", () => {
  it("creates and updates customer records with employees", async () => {
    const created = await localWorkspaceRecordStore.upsertCustomer(null, {
      company: {
        companyName: "Northstar",
        emailDomainSuffix: "northstar.com",
        type: "Brand owner",
      },
      employees: [
        {
          id: "employee-1",
          userName: "Mia Chen",
          emailPrefix: "mia",
          title: "Manager",
          tel: "+1 555 0001",
        },
      ],
    });

    const updated = await localWorkspaceRecordStore.upsertCustomer(created.id, {
      company: {
        companyName: "Northstar Group",
        emailDomainSuffix: "northstar.com",
        type: "Brand owner",
      },
      employees: [
        {
          id: "employee-1",
          userName: "Mia Chen",
          emailPrefix: "mia",
          title: "Director",
          tel: "+1 555 0001",
        },
      ],
    });

    const records = await localWorkspaceRecordStore.listCustomers();
    expect(records).toHaveLength(1);
    expect(updated.id).toBe(created.id);
    expect(records[0].company.companyName).toBe("Northstar Group");
    expect(records[0].employees[0].title).toBe("Director");
  });

  it("creates supplier records with structured product types", async () => {
    await localWorkspaceRecordStore.upsertSupplier(null, {
      company: {
        companyName: "Bright Trim",
        emailDomainSuffix: "brighttrim.com",
        productTypes: ["woven-label", "hang-tag"],
      },
      employees: [
        {
          id: "employee-1",
          userName: "Aaron Lee",
          emailPrefix: "aaron",
          title: "Coordinator",
          tel: "+1 555 0002",
        },
      ],
    });

    const records = await localWorkspaceRecordStore.listSuppliers();
    expect(records[0].company.productTypes).toEqual(["woven-label", "hang-tag"]);
  });

  it("normalizes legacy supplier product types from local storage", async () => {
    localStorage.setItem(
      "ica:workspace:suppliers",
      JSON.stringify([
        {
          id: "supplier-1",
          company: {
            companyName: "Legacy Supplier",
            emailDomainSuffix: "legacy.example",
            productTypes: ["label", "zipper"],
          },
          employees: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const records = await localWorkspaceRecordStore.listSuppliers();
    expect(records[0].company.productTypes).toEqual(["woven-label", "metal"]);
  });

  it("creates and updates product records", async () => {
    const created = await localWorkspaceRecordStore.upsertProduct(null, {
      productType: "woven-label",
      subject: "Woven label",
      detail: "Main neck label",
      material: "Polyester",
      colorNotes: "Black and white",
      parameters: {
        size: "45 x 20 mm",
        fold: "Center fold",
      },
      unitPrice: "0.032",
      priceUnit: "per pc",
      image: {
        name: "label.webp",
        url: "https://example.com/label.webp",
        storagePath: "user/label.webp",
      },
    });

    await localWorkspaceRecordStore.upsertProduct(created.id, {
      productType: "hang-tag",
      subject: "Woven label set",
      detail: "Main neck label and care label",
      material: "Polyester",
      colorNotes: "Black and white",
      parameters: {
        size: "60 x 90 mm",
        finish: "Matte lamination",
      },
      unitPrice: "0.075",
      priceUnit: "per pc",
      image: null,
    });

    const records = await localWorkspaceRecordStore.listProducts();
    expect(records).toHaveLength(1);
    expect(records[0].productType).toBe("hang-tag");
    expect(records[0].unitPrice).toBe("0.075");
    expect(records[0].subject).toBe("Woven label set");
    expect(records[0].image).toBeNull();
  });

  it("normalizes legacy product records from local storage", async () => {
    localStorage.setItem(
      "ica:workspace:products",
      JSON.stringify([
        {
          id: "product-1",
          subject: "Old trim",
          detail: "Legacy product",
          material: "Polyester",
          colorNotes: "Black",
          parameters: {
            size: "45 x 20 mm",
            ignored: 123,
          },
          image: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const records = await localWorkspaceRecordStore.listProducts();
    expect(records[0].productType).toBe("woven-label");
    expect(records[0].parameters).toEqual({ size: "45 x 20 mm" });
    expect(records[0].unitPrice).toBe("0");
    expect(records[0].priceUnit).toBe("per pc");
  });
});
