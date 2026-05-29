"use client";
import {
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenu,
  Button,
} from "@/components/ui";
import { Icon } from "@/components/common/icon";
import Link from "next/link";

type Props = {
  id: string;
  route: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

export function ButtonActionLink({
  id,
  route,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
}: Props) {
  const detailsPath = `${route}/${id}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full"
        >
          <Icon name="Ellipsis" className="w-4 h-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-max">
        <DropdownMenuGroup>
          {primaryActionLabel && onPrimaryAction && (
            <DropdownMenuItem
              className="rounded-md cursor-pointer"
              onClick={onPrimaryAction}
            >
              <Icon name="CheckCheck" className="w-4 h-4 text-muted-foreground" />
              <span>{primaryActionLabel}</span>
            </DropdownMenuItem>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <DropdownMenuItem
              className="rounded-md cursor-pointer"
              onClick={onSecondaryAction}
            >
              <Icon name="Ban" className="w-4 h-4 text-muted-foreground" />
              <span>{secondaryActionLabel}</span>
            </DropdownMenuItem>
          )}
          <Link href={detailsPath}>
            <DropdownMenuItem className="rounded-md cursor-pointer">
              <Icon name="Eye" className="w-4 h-4 text-muted-foreground" />
              <span>Ver detalhes</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
