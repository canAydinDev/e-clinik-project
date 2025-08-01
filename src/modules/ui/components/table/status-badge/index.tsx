import { StatusIcon } from "@/constants";
import clsx from "clsx";
import Image from "next/image";

export const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <div
      className={clsx("status-badge flex items-center gap-2", {
        "bg-green-600": status === "scheduled",
        "bg-blue-600": status === "pending",
        "bg-red-600": status === "cancelled",
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt="status"
        width={24}
        height={24}
        className="h-fit w-3"
      />

      <span
        className={clsx("text-12-semibold text-white capitalize", {
          "text-green-300": status === "scheduled",
          "text-blue-300": status === "pending",
          "text-red-300": status === "cancelled",
        })}
      >
        {status === "scheduled" && "Planlandı"}
        {status === "pending" && "Bekleyen"}
        {status === "cancelled" && "İptal edildi"}
      </span>
    </div>
  );
};
