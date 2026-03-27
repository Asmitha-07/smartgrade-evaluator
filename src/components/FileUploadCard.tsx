import { Upload } from "lucide-react";
import { useRef } from "react";

interface FileUploadCardProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
}

const FileUploadCard = ({ label, file, onFileSelect }: FileUploadCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/50 px-6 py-10 transition-colors hover:border-foreground/40 hover:bg-secondary"
    >
      <Upload className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      {file ? (
        <span className="text-xs text-muted-foreground truncate max-w-full">
          {file.name}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">
          Click to browse · PDF only
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
    </button>
  );
};

export default FileUploadCard;
