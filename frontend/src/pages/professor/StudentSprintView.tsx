import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
export default function StudentSprintView() {
  const { computingId } = useParams<{ computingId: string }>();
  const { sprintId } = useParams<{ sprintId: string }>();

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="space-y-8">Hi</div>
      </div>
    </div>
  );
}
