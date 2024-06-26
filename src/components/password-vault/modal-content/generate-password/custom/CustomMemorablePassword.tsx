import { Switch } from "@/components/ui/switch";
import Text from "@/shared/components/typography";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

import { InformationDiamondIcon } from "hugeicons-react";
import { Tooltip } from "react-tooltip";
interface CustomMemorablePasswordProps {
  options: {
    text: string;
    isTrue: boolean;
  }[];
  setOptions: React.Dispatch<
    React.SetStateAction<
      {
        text: string;
        isTrue: boolean;
      }[]
    >
  >;
}

interface TooltipInfo {
  header: string;
  message: string;
}

interface TooltipsInfo {
  [key: string]: TooltipInfo;
}

const CustomMemorablePassword: React.FC<CustomMemorablePasswordProps> = ({
  setOptions,
  options,
}) => {
  const handleChecked = (index: number) => {
    setOptions((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isTrue: !item.isTrue } : item
      )
    );
  };

  const tooltipsInfo: TooltipsInfo = {
    "Use number": {
      header: "Numeric Characters",
      message: "Include numbers (0-9) to make your password stronger.",
    },
    "Use characters": {
      header: "Special Characters",
      message: "Use symbols like @, #, $ to add complexity to your password.",
    },
    "Use Uppercase": {
      header: "Uppercase Letters",
      message: "Capital letters (A-Z) can help secure your password further.",
    },
  };

  return (
    <div className="mt-4">
      <div className="h-[0.5px] border-b-grey-200 w-[60%]" />
      {options.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-[10px] border-b-[0.5px] border-b-grey-200"
        >
          <div className="flex items-center gap-1">
            <Text size="normal" variant="primary-200">
              {item.text}
            </Text>

            <a data-tooltip-id={`tooltip-${index}`}>
              <InformationDiamondIcon className="size-5 text-[#197CE2] cursor-pointer" />
            </a>
            <Tooltip
              id={`tooltip-${index}`}
              style={{ backgroundColor: "#001F3F" }}
            >
              <Text size="md" weight="medium" className="text-white">
                {tooltipsInfo[item.text]?.header}
              </Text>
              <Text
                weight="regular"
                className="text-white text-[12px] max-w-[150px] w-full"
              >
                {tooltipsInfo[item.text]?.message}
              </Text>
            </Tooltip>

            {/* <Popover>
              <PopoverTrigger>
                <InformationDiamondIcon className="size-5 text-[#197CE2] cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent
                avoidCollisions={true}
                side="right"
                hideWhenDetached={true}
                className="bg-primary-100 border-0 relative !w-fit "
              >
                <Text size="md" weight="medium" className="text-white">
                  {tooltipsInfo[item.text]?.header}
                </Text>
                <Text
                  weight="regular"
                  className="text-white text-[12px] max-w-[150px] w-full"
                >
                  {tooltipsInfo[item.text]?.message}
                </Text>

                <div className="bg-primary-100 w-[14px] h-2 absolute -left-[3px] -translate-y-[50%] top-[50%] rotate-45" />
              </PopoverContent>
            </Popover> */}

            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InformationDiamondIcon className="size-5 text-[#197CE2] cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent
                  avoidCollisions={true}
                  className=" relative bg-primary-100 "
                >
                  <Text size="md" weight="medium" className="text-white">
                    {tooltipsInfo[item.text]?.header}
                  </Text>
                  <Text
                    weight="regular"
                    className="text-white text-[12px] max-w-[150px] w-full"
                  >
                    {tooltipsInfo[item.text]?.message}
                  </Text>
                  <div className="bg-primary-100 w-[14px] h-2 absolute -bottom-[1px] -translate-x-[50%] left-[50%] rotate-45" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
          <Switch
            checked={item.isTrue}
            onCheckedChange={() => handleChecked(index)}
          />
        </div>
      ))}
    </div>
  );
};

export default CustomMemorablePassword;
