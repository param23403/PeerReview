import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
export default function StudentSprintView() {
  const { computingId } = useParams<{ computingId: string }>();
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };
  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Button onClick={handleBackClick}>Back</Button>
      <div className="w-full max-w-3xl">
        <div className="space-y-8">Hi</div>
      </div>
    </div>
  );
}
