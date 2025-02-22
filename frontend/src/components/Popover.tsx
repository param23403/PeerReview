import { Info } from "lucide-react";
import { PopoverContent, PopoverTrigger } from "./ui/popover";
import { Popover } from "@radix-ui/react-popover";

const RubricPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Info className="h-4 w-4 text-muted-foreground inline-block ml-2 cursor-help" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] max-w-[90vw]"
        align="start"
        side="top"
        sideOffset={10}
        alignOffset={20}
      >
        <h4 className="font-semibold mb-2">Overall Evaluation Rubric</h4>
        <ul className="text-sm space-y-2">
          <li>
            <strong>5:</strong>
            {} Student has been a solid, contributing member up to this point, often going above and beyond what was
            needed. Student fulfilled their team role exceptionally well.
          </li>
          <li>
            <strong>4:</strong>
            {} Student has been a solid a contributing member up to this point, but fell short in a few instances. Overall,
            the student has been a reasonable member of the team.
          </li>
          <li>
            <strong>3:</strong>
            {} Student has been a contributing member, but fell short on at least one occasion and another team member had
            to make up their work.
          </li>
          <li>
            <strong>2:</strong>
            {} Student contributed, but required excessive reminders and/or was often late. Any contributions created
            required rework by others.
          </li>
          <li>
            <strong>1:</strong>
            {} Student was actively a hindrance to the team, preventing overall progress, regardless of the student's
            individual contributions.
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export default RubricPopover;