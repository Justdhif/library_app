"use client";

import { useState } from "react";
import { AuthorsHeader } from "./_components/AuthorsHeader";
import { AuthorsClient } from "./_components/AuthorsClient";

export default function AuthorsPage() {
  const [triggerAddAuthor, setTriggerAddAuthor] = useState(0);

  const handleAddAuthor = () => {
    setTriggerAddAuthor(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <AuthorsHeader onAddAuthor={handleAddAuthor} />
      <AuthorsClient triggerAddAuthor={triggerAddAuthor} />
    </div>
  );
}
