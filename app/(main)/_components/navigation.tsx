"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserItem } from "./user-item";
import { Item } from "./item";
import { DocumentsList } from "./documents-list";
import { Note, NotesClient } from '@/lib/notes-client'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TrashBox } from './trash-box'
import { SearchCommand } from '@/components/ui/search-command'
import { useSearch } from '@/hooks/use-search'

export const Navigation = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const router = useRouter();
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [client, setClient] = useState<NotesClient>();
  const [documents, SetDocuments] = useState<Note[]>();
  const search = useSearch();

  const onOpenSearch = () => {
    handleUpdateItems();
    search.onOpen();
  }

  const handleUpdateItems = (
    id: string = "00000000-0000-0000-0000-000000000000"
  ) => {
    const recursiveRemove = (items: Note[], idToDelete: string) => {
      const index = items.findIndex((n) => n.id === idToDelete);
      if (index < 0) return;

      items.splice(index, 1);
      const toDelete = items.filter((note) => note.parentNoteId === idToDelete);
      for (const note of toDelete) {
        recursiveRemove(items, note.id);
      }
    };

    if (!documents) return;

    if (id === "00000000-0000-0000-0000-000000000000") {
      client?.getAllNotes().then(SetDocuments);
      return;
    }

    const newDocuments = [...documents];
    recursiveRemove(newDocuments, id);
    if (!client) {
      SetDocuments(newDocuments);
    } else {
      client?.getNote(id).then((note) => {
        if (!note || note.isArchived === true) {
          SetDocuments(newDocuments);
        } else {
          client.getChildren(note.id).then((notes) => {
            SetDocuments([...newDocuments, note, ...notes]);
          });
        }
      });
    }
  };

  const handleCreate = () => {
    if (!client) return;
    const promise = client.createNote({
        title: "Untitled",
      })
      .then((id) => router.push(`/documents/${id}`));

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  useEffect(() => {
    setClient(new NotesClient("https://localhost:7090"));
  }, []);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "240px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  return (
    <>
      <SearchCommand
        documents={documents}
        onUpdateItems={handleUpdateItems}
      />
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item
            label="Search"
            isSearch
            icon={Search}
            onClick={onOpenSearch}
          />
          <Item
            label="Settings"
            icon={Settings}
            onClick={() => {}} // TODO: implement this function
          />
          <Item
            onClick={handleCreate}
            label="New page"
            icon={PlusCircle}
          />
        </div>
        <div className="mt-4">
          {client && (
            <DocumentsList
              documents={documents}
              setDocuments={SetDocuments}
              client={client}
              onUpdateItems={handleUpdateItems}
            />
          )}
          <Item
            onClick={handleCreate}
            icon={Plus}
            label="Add a page"
          />
          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-72"
              side={isMobile ? "bottom" : "right"}
            >
              {client && (
                <TrashBox
                  client={client}
                  onUpdateItems={handleUpdateItems}
                />
              )}
            </PopoverContent>
          </Popover>
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <MenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
    </>
  );
};
