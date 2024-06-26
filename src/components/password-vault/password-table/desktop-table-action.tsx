/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGetPasswordProps } from "@/api/password/get-password";
import { Dialog } from "@/components/ui/dialog";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import ActionPopover from "@/shared/components/action-popover";
import { MoreHorizontalCircle01Icon, MoreVerticalIcon } from "hugeicons-react";
import { ReactNode, useState } from "react";

interface DesktopTableActionProps<T> {
  item: IGetPasswordProps;
  setShowMobileTable: React.Dispatch<React.SetStateAction<string | null>>;
  actions: {
    name: string;
    Component: (props: T) => ReactNode;
  }[];
  setIsTableDataSelected: React.Dispatch<
    React.SetStateAction<IGetPasswordProps[]>
  >;
  handleDelete: (id: any, callback: () => void) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DesktopTableAction: React.FC<DesktopTableActionProps<any>> = ({
  item,
  setShowMobileTable,
  actions,
  setIsTableDataSelected,

  handleDelete,
}) => {
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  // const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const actionState = [
    { open: openEdit, action: setOpenEdit },
    // { open: openView, action: setOpenView },
    { open: openDelete, action: setOpenDelete },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedAction = actions.map((item: any, index: number) => ({
    ...item,
    open: actionState[index]?.open,
    action: actionState[index]?.action,
  }));
  const data = item;
  return (
    <div className=" h-full flex justify-center items-center relative">
      <div className="hidden sm:block">
        <Popover>
          <PopoverTrigger onClick={() => setIsTableDataSelected([])}>
            <MoreVerticalIcon className="text-[#141B34] hidden sm:block cursor-pointer" />
          </PopoverTrigger>
          <ActionPopover actions={updatedAction} />
        </Popover>
      </div>
      <MoreHorizontalCircle01Icon
        onClick={() => {
          setShowMobileTable((prev: string | null) =>
            prev === data.id ? null : data.id
          );
          setIsTableDataSelected([]);
        }}
        className="text-[#141B34] cursor-pointer sm:hidden"
      />

      {updatedAction?.map(({ Component, ...item }) => (
        <Dialog open={item.open} onOpenChange={item.action}>
          <Component
            data={data}
            open={item.open}
            setOpen={item.action}
            handleDelete={handleDelete}
          />
        </Dialog>
      ))}
    </div>
  );
};

export default DesktopTableAction;
