"use client";

import { ElementRef, useRef, useState } from "react";
import { ImageIcon, Smile, X } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Emoji } from "emoji-picker-react";

import { useCoverImage } from "@/hooks/use-cover-image";
import { Button } from "@/components/ui/button";
import { IconPicker } from "./icon-picker";
import { Note } from "@/lib/notes-client";

interface ToolbarProps {
  preview?: boolean;
  initialData: Note;
  onIconSelect?: (icon: string) => void;
  onRemoveIcon?: () => void;
  onTitleChange?: (title: string) => void;
}

export function Toolbar({
  preview,
  initialData,
  onIconSelect,
  onRemoveIcon,
  onTitleChange,
}: ToolbarProps) {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "Untitled");
  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setTitle(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInputTitle = (value: string) => {
    const title = value || "Untitled";
    setTitle(value);
    onTitleChange?.(title);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  return (
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker onChange={(icon) => onIconSelect?.(icon)}>
            <div className="hover:opacity-75 transition">
              <Emoji
                unified={initialData.icon.codePointAt(0)?.toString(16)!}
                size={60}
              />
            </div>
          </IconPicker>
          <Button
            onClick={() => onRemoveIcon?.()}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <div className="pt-6">
          <Emoji
            unified={initialData.icon.codePointAt(0)?.toString(16)!}
            size={60}
          />
        </div>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={(icon) => onIconSelect?.(icon)}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2" />
              Add icon
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={coverImage.onOpen}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add cover
          </Button>
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={title}
          onChange={(e) => onInputTitle(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
}
