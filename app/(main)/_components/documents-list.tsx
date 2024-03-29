"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Item } from "./item";
import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Note } from "@/lib/notes-client";
import { useNavigationContext } from "@/contexts/navigation-context";

interface DocumentListProps {
  parentDocumentId?: string;
  level?: number;
}

export const DocumentsList = ({
  parentDocumentId = "00000000-0000-0000-0000-000000000000",
  level = 0,
}: DocumentListProps) => {
  const {
    notesClient,
    navigationDocuments,
    setNavigationDocuments,
  } = useNavigationContext();
  const router = useRouter();
  const params = useParams();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<Note[]>();

  useEffect(() => {
    if (
      !navigationDocuments?.some((d) => d.parentNoteId === parentDocumentId)
    ) {
      notesClient?.getChildren(parentDocumentId).then((notes) => {
        setNavigationDocuments(
          navigationDocuments ? [...navigationDocuments, ...notes] : notes
        );
      });
    }
  }, [notesClient, parentDocumentId]);

  useEffect(() => {
    const documents = navigationDocuments
      ?.filter((item) => item.parentNoteId === parentDocumentId)
      .sort((a, b) => (a.creationDate < b.creationDate ? -1 : 1));
    setItems(documents);
  }, [navigationDocuments, parentDocumentId]);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  if (!items) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p
        style={{
          paddingLeft: level ? `${level * 12 + 25}px` : undefined,
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>
      {items.map((document) => (
        <div key={document.id}>
          <Item
            id={document.id}
            creationDate={document.creationDate}
            editDate={document.editDate}
            onClick={() => {router.push(`/documents/${document.id}`)}}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={params.documentId === document.id}
            level={level}
            onExpand={() => onExpand(document.id)}
            expanded={expanded[document.id]}
          />
          {expanded[document.id] && (
            <DocumentsList
              parentDocumentId={document.id}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};
