"use client";

import { useState } from "react";
import { CategoriesHeader } from "./_components/CategoriesHeader";
import { CategoriesClient } from "./_components/CategoriesClient";

export default function CategoriesPage() {
  const [triggerAddCategory, setTriggerAddCategory] = useState(0);

  const handleAddCategory = () => {
    setTriggerAddCategory(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <CategoriesHeader onAddCategory={handleAddCategory} />
      <CategoriesClient triggerAddCategory={triggerAddCategory} />
    </div>
  );
}
