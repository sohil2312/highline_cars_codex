"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function MediaButton({
  label,
  accept,
  multiple,
  capture,
  onFiles
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  capture?: "environment" | "user";
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        capture={capture}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) {
            onFiles(files);
            event.currentTarget.value = "";
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
    </>
  );
}
