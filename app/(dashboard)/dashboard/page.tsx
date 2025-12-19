"use client";

import React, { useState } from "react";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseList from "@/components/expenses/ExpenseList";

export default function ExpensesClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div style={{ maxWidth: 480 }}>
        <ExpenseForm onAdded={() => setRefreshKey((k) => k + 1)} />
      </div>
      <div style={{ marginTop: 20 }}>
        {/* key forces reload of ExpenseList when a new item is added */}
        <div key={refreshKey}>
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}