"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { getBrands, getModels, getVariants, getBodyType } from "@/lib/vehicle-data";

type Props = {
  make: string;
  model: string;
  variant: string;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  onBodyTypeDetected?: (bodyType: string) => void;
};

export function VehicleSelector({
  make,
  model,
  variant,
  onMakeChange,
  onModelChange,
  onVariantChange,
  onBodyTypeDetected,
}: Props) {
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);

  const brands = useMemo(() => getBrands(), []);

  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  const models = useMemo(() => (make ? getModels(make) : []), [make]);

  const filteredModels = useMemo(() => {
    if (!modelSearch) return models;
    const q = modelSearch.toLowerCase();
    return models.filter((m) => m.name.toLowerCase().includes(q));
  }, [models, modelSearch]);

  const variants = useMemo(() => (make && model ? getVariants(make, model) : []), [make, model]);

  const filteredVariants = useMemo(() => {
    if (!variantSearch) return variants;
    const q = variantSearch.toLowerCase();
    return variants.filter((v) => v.toLowerCase().includes(q));
  }, [variants, variantSearch]);

  // Auto-detect body type when model changes
  useEffect(() => {
    if (make && model && onBodyTypeDetected) {
      const bt = getBodyType(make, model);
      if (bt) onBodyTypeDetected(bt);
    }
  }, [make, model, onBodyTypeDetected]);

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    maxHeight: 240,
    overflowY: "auto",
    background: "#fff",
    border: "2px solid #000",
    boxShadow: "4px 4px 0 #000",
  };

  const itemStyle: React.CSSProperties = {
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 14,
    borderBottom: "1px solid #e5e5e5",
  };

  const activeItemStyle: React.CSSProperties = {
    ...itemStyle,
    background: "#f97316",
    color: "#fff",
    fontWeight: 600,
  };

  return (
    <>
      {/* Brand */}
      <div className="relative">
        <label className="text-sm font-medium">Brand / Make</label>
        <Input
          value={brandOpen ? brandSearch : make}
          placeholder="Search brand..."
          onFocus={() => {
            setBrandOpen(true);
            setBrandSearch(make);
          }}
          onChange={(e) => {
            setBrandSearch(e.target.value);
            setBrandOpen(true);
          }}
          onBlur={() => setTimeout(() => setBrandOpen(false), 200)}
        />
        {brandOpen && filteredBrands.length > 0 && (
          <div style={dropdownStyle}>
            {filteredBrands.map((b) => (
              <div
                key={b}
                style={b === make ? activeItemStyle : itemStyle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onMakeChange(b);
                  onModelChange("");
                  onVariantChange("");
                  setBrandSearch("");
                  setBrandOpen(false);
                }}
              >
                {b}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model */}
      <div className="relative">
        <label className="text-sm font-medium">Model</label>
        <Input
          value={modelOpen ? modelSearch : model}
          placeholder={make ? "Search model..." : "Select brand first"}
          disabled={!make}
          onFocus={() => {
            setModelOpen(true);
            setModelSearch(model);
          }}
          onChange={(e) => {
            setModelSearch(e.target.value);
            setModelOpen(true);
          }}
          onBlur={() => setTimeout(() => setModelOpen(false), 200)}
        />
        {modelOpen && filteredModels.length > 0 && (
          <div style={dropdownStyle}>
            {filteredModels.map((m) => (
              <div
                key={m.name}
                style={m.name === model ? activeItemStyle : itemStyle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onModelChange(m.name);
                  onVariantChange("");
                  setModelSearch("");
                  setModelOpen(false);
                }}
              >
                <span>{m.name}</span>
                <span style={{ fontSize: 11, color: m.name === model ? "#fff" : "#888", marginLeft: 8 }}>
                  {m.bodyType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variant */}
      <div className="relative">
        <label className="text-sm font-medium">Variant</label>
        <Input
          value={variantOpen ? variantSearch : variant}
          placeholder={model ? "Search variant..." : "Select model first"}
          disabled={!model}
          onFocus={() => {
            setVariantOpen(true);
            setVariantSearch(variant);
          }}
          onChange={(e) => {
            setVariantSearch(e.target.value);
            setVariantOpen(true);
          }}
          onBlur={() => setTimeout(() => setVariantOpen(false), 200)}
        />
        {variantOpen && filteredVariants.length > 0 && (
          <div style={dropdownStyle}>
            {filteredVariants.map((v) => (
              <div
                key={v}
                style={v === variant ? activeItemStyle : itemStyle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onVariantChange(v);
                  setVariantSearch("");
                  setVariantOpen(false);
                }}
              >
                {v}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
