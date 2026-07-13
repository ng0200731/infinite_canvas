import { describe, expect, it } from "vitest";

import {
  mergeProjectMetadata,
  parseLegacyProjectDescription,
  serializeLegacyProjectDescription,
} from "./project-metadata";

describe("project metadata", () => {
  it("reads legacy JSON project descriptions without exposing the transport shape", () => {
    const metadata = parseLegacyProjectDescription(
      JSON.stringify({
        version: 1,
        customer: { id: "customer-1", name: "Harborline Retail Ltd.", domain: "gmail.com" },
        employee: {
          userName: "Mia Chen 2",
          title: "Merchandising Manager",
          email: "eric.brilliant@gmail.com",
          tel: "+86 755 8821 1042",
        },
      }),
    );

    expect(metadata).toMatchObject({
      customerId: "customer-1",
      customerName: "Harborline Retail Ltd.",
      employeeName: "Mia Chen 2",
      employeeEmail: "eric.brilliant@gmail.com",
    });
  });

  it("prefers first-class project columns over legacy values", () => {
    expect(
      mergeProjectMetadata(
        { employeeEmail: "new@example.com" },
        JSON.stringify({
          version: 1,
          customer: { id: "customer-1", name: "Customer" },
          employee: {
            userName: "Person",
            title: "Manager",
            email: "old@example.com",
            tel: "123",
          },
        }),
      ).employeeEmail,
    ).toBe("new@example.com");
  });

  it("serializes metadata for databases without first-class project metadata columns", () => {
    const description = serializeLegacyProjectDescription({
      customerId: "customer-1",
      customerName: "Harborline Retail Ltd.",
      employeeId: "employee-1",
      employeeName: "Mia Chen",
      employeeTitle: "Merchandising Manager",
      employeeEmail: "mia@example.com",
      employeeTel: "+86 755 8821 1042",
      currencyCode: "USD",
      currencyName: "US Dollar",
      currencySymbol: "$",
      destinationCountryCode: "US",
      destinationCountryName: "United States",
    });

    expect(parseLegacyProjectDescription(description)).toMatchObject({
      customerName: "Harborline Retail Ltd.",
      employeeName: "Mia Chen",
      currencyCode: "USD",
      destinationCountryName: "United States",
    });
  });
});
