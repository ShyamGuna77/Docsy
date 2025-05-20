"use client";

import React from 'react'
import { cn } from '@/lib/utils';
import { BoldIcon, ItalicIcon, ListCollapseIcon, ListTodoIcon , LucideIcon, MessageSquarePlusIcon, PrinterIcon, Redo2Icon, RemoveFormattingIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon } from 'lucide-react';
import { useEditorStore } from '@/store/use-editor-store';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LineHeightButton = () => {
  const {editor} = useEditorStore();

  const lineHeights = [
    {label: "Default", value: "normal"},
    {label: "Single", value: "1"},
    {label: "1.15", value: "1.15"},
    {label: "1.5", value: "1.5"},
    {label: "Double", value: "2"},
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm">
          <ListCollapseIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-1 flex flex-col gap-y-1'>
        {lineHeights.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => editor?.chain().focus().setLineHeight(value).run()}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80",
              editor?.getAttributes("paragraph").lineHeight === value &&
                "bg-neutral-200/80"
            )}
          >
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
interface ToolbarButtonProps {
    onClick?:() => void;
    isActive?: boolean;
    icon: LucideIcon;
}

const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
}: ToolbarButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80",
        isActive && "bg-neutral-200/80"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
};




export const Toolbar = () => {
    const {editor} = useEditorStore();
    const sections: {
      label: string;
      icon: LucideIcon;
      onClick: () => void;
      isActive?: boolean;
    }[][] = [
      [
        {
          label: "Undo",
          icon: Undo2Icon,
          onClick: () => editor?.chain().focus().undo().run(),
        },
        {
          label: "Redo",
          icon: Redo2Icon,
          onClick: () => editor?.chain().focus().redo().run(),
        },
        {
          label: "Print",
          icon: PrinterIcon,
          onClick: () => window.print(),
        },
        {
          label: "Spell Check",
          icon: SpellCheckIcon,
          onClick: () => {
            const current = editor?.view.dom.getAttribute("spellcheck");
            editor?.view.dom.setAttribute(
              "spellcheck",
              current === "false" ? "true" : "false"
            );
          },
        },
      ],
      [
        {
          label: "Bold",
          icon: BoldIcon,
          isActive: editor?.isActive("bold"),
          onClick: () => editor?.chain().focus().toggleBold().run(),
        },
        {
          label: "Italic",
          icon: ItalicIcon,
          isActive: editor?.isActive("italic"),
          onClick: () => editor?.chain().focus().toggleItalic().run(),
        },
        {
          label: "Underline",
          icon: UnderlineIcon,
          isActive: editor?.isActive("underline"),
          onClick: () => editor?.chain().focus().toggleUnderline().run(),
        },
      ],
      [
        {
          label: "Comment",
          icon: MessageSquarePlusIcon,
          onClick: () => editor?.chain().focus().addPendingComment().run(),
          isActive: editor?.isActive("liveblocksCommentMark"),
        },
        {
          label: "List Todo",
          icon: ListTodoIcon,
          onClick: () => editor?.chain().focus().toggleTaskList().run(),
          isActive: editor?.isActive("taskList"),
        },
        {
          label: "Remove Formatting",
          icon: RemoveFormattingIcon,
          onClick: () => editor?.chain().focus().unsetAllMarks().run(),
        },
      ],
    ];

 return (
    <div className="bg-[#F1F4F9] px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
      {sections[0].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
      <Separator orientation="vertical" className="h-6 bg-neutral-300" />
      {/* <FontFamilyButton /> */}
      <Separator orientation="vertical" className="h-6 bg-neutral-300" />
      {/* <HeadingLevelButton /> */}
      <Separator orientation="vertical" className="h-6 bg-neutral-300" />
      {/* <FontSizeButton /> */}
      <Separator orientation="vertical" className="h-6 bg-neutral-300" />
      {sections[1].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
      {/* <TextColorButton />
      <HighlightColorButton /> */}
      <Separator orientation="vertical" className="h-6 bg-neutral-300" />
      {/* <LinkButton />
      <ImageButton /> */}
      {/* <AlignButton /> */}
      <LineHeightButton />
      {/* <ListButton /> */}
      {sections[2].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
    </div>
  );



}