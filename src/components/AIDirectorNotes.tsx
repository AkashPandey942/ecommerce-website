"use client";

interface AIDirectorNotesProps {
  value?: string;
  onChange?: (val: string) => void;
}

const AIDirectorNotes = ({ value, onChange }: AIDirectorNotesProps) => {
  return (
    <div className="relative w-full h-[95px] bg-black/30 rounded-[10px] p-4 border border-white/20 focus-within:border-[#7C4DFF] transition-all text-sm">
      <textarea
        aria-label="AI Director Notes (Optional)"
        placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
        className="w-full h-full bg-transparent resize-none font-roboto font-normal text-base leading-[19px] text-white placeholder:text-[#C2C6D6]/40 focus:outline-none"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default AIDirectorNotes;
