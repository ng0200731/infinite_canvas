"use client";

import { useState } from "react";
import { Boxes, PackageSearch, Users } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderedOptionSettingsPanel } from "@/components/settings/ordered-option-settings-panel";
import { SettingsPanelHeader } from "@/components/settings/settings-panel-header";

type DropdownMenuName = "customer" | "supplier" | "product";
type DropdownSettingName = "supplier-product-type";

const menuOptions: Array<{
  value: DropdownMenuName;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: "supplier",
    label: "Supplier",
    description: "Supplier record and supplier product dropdowns.",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Customer dropdown settings can be added here later.",
    disabled: true,
  },
  {
    value: "product",
    label: "Product",
    description: "Product-level dropdown settings can be added here later.",
    disabled: true,
  },
];

const supplierDropdowns: Array<{
  value: DropdownSettingName;
  label: string;
  description: string;
}> = [
  {
    value: "supplier-product-type",
    label: "Product type",
    description: "Shown in Supplier > New, supplier products, and supplier canvas nodes.",
  },
];

export function DropdownSettingsPanel() {
  const [selectedMenu, setSelectedMenu] = useState<DropdownMenuName>("supplier");
  const [selectedSetting, setSelectedSetting] =
    useState<DropdownSettingName>("supplier-product-type");
  const selectedMenuOption = menuOptions.find((option) => option.value === selectedMenu);
  const selectedSettingOption = supplierDropdowns.find(
    (option) => option.value === selectedSetting,
  );

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5">
      <SettingsPanelHeader
        title="Dropdown setting"
        description="Choose a left-menu area first, then choose which dropdown list to maintain."
      />

      <div className="bg-card grid gap-4 rounded-lg border p-5 shadow-sm md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-semibold tracking-wide uppercase">Left menu</label>
          <Select
            value={selectedMenu}
            onValueChange={(value) => setSelectedMenu(value as DropdownMenuName)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {menuOptions.map((option) => {
                const Icon =
                  option.value === "supplier"
                    ? PackageSearch
                    : option.value === "customer"
                      ? Users
                      : Boxes;
                return (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {option.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs leading-5">
            {selectedMenuOption?.description}
          </p>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold tracking-wide uppercase">Dropdown</label>
          <Select
            value={selectedSetting}
            onValueChange={(value) => setSelectedSetting(value as DropdownSettingName)}
            disabled={selectedMenu !== "supplier"}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supplierDropdowns.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs leading-5">
            {selectedSettingOption?.description}
          </p>
        </div>
      </div>

      <OrderedOptionSettingsPanel kind={selectedSetting} />
    </section>
  );
}
