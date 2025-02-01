import { Info } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function RubricPopover() {
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="absolute top-0 right-0">
        <Info className="h-4 w-4" />
        <span className="sr-only">Open rubric</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <h4 className="font-semibold mb-2">Overall Evaluation Rubric</h4>
      <ul className="text-sm space-y-2">
        <li>
          <strong>5:</strong> Exceptional contributor, often exceeding expectations.
        </li>
        <li>
          <strong>4:</strong> Solid contributor with minor shortcomings.
        </li>
        <li>
          <strong>3:</strong> Contributor with occasional significant shortfalls.
        </li>
        <li>
          <strong>2:</strong> Contributor requiring excessive reminders or rework.
        </li>
        <li>
          <strong>1:</strong> Active hindrance to team progress.
        </li>
      </ul>
    </PopoverContent>
  </Popover>
}